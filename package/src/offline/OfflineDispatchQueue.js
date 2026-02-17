const STORAGE_KEY = "OFFLINE_DISPATCH_QUEUE";
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // for exponential backoff

const safeParse = (raw, fallback = []) => {
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export class OfflineDispatchQueue {
    constructor(repository, storage) {
        this.repository = repository; // DispatchMessageRepository
        this.storage = storage; // asyncStorageAdapter
        this.isProcessing = false;
    }

    // -------------------------
    // LOAD / SAVE
    // -------------------------
    async #loadQueue() {
        const raw = await this.storage.getItem(STORAGE_KEY);
        return raw ? safeParse(raw, []) : [];
    }

    async #saveQueue(queue) {
        await this.storage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }

    // -------------------------
    // ENQUEUE
    // -------------------------
    async enqueue(payload) {
        const queue = await this.#loadQueue();

        // prevent duplicate enqueue of same message id
        if (queue.some((q) => q.id === payload.id)) return;

        queue.push({
            id: payload.id,
            payload,
            status: "pending", // pending | sending | failed | sent
            retries: 0,
            createdAt: Date.now(),
            lastAttemptAt: null,
        });

        await this.#saveQueue(queue);
    }

    // -------------------------
    // PROCESS QUEUE
    // -------------------------
    async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            let queue = await this.#loadQueue();

            for (const item of queue) {
                if (item.status === "sent") continue;
                if (item.retries >= MAX_RETRIES) continue;

                // exponential backoff delay
                if (item.lastAttemptAt) {
                    const backoff = Math.min(
                        30000,
                        BASE_DELAY_MS * 2 ** item.retries
                    );
                    const elapsed = Date.now() - item.lastAttemptAt;

                    if (elapsed < backoff) continue;
                }

                try {
                    item.status = "sending";
                    item.lastAttemptAt = Date.now();
                    await this.#saveQueue(queue);

                    await this.repository.dispatchMessage(item.payload);

                    item.status = "sent";
                } catch (_error) {
                    item.status = "failed";
                    item.retries += 1;
                }

                await this.#saveQueue(queue);
            }

            // remove successfully sent items
            queue = queue.filter((q) => q.status !== "sent");
            await this.#saveQueue(queue);
        } finally {
            this.isProcessing = false;
        }
    }

    // -------------------------
    // GET FAILED ITEMS
    // -------------------------
    async getFailed() {
        const queue = await this.#loadQueue();
        return queue.filter((item) => item.status === "failed");
    }

    // -------------------------
    // RETRY ALL FAILED
    // -------------------------
    async retryFailed() {
        let queue = await this.#loadQueue();

        queue = queue.map((item) =>
            item.status === "failed"
                ? { ...item, status: "pending" }
                : item
        );

        await this.#saveQueue(queue);
        await this.process();
    }

    // -------------------------
    // RETRY SINGLE MESSAGE
    // -------------------------
    async retryByMessageId(messageId) {
        let queue = await this.#loadQueue();

        queue = queue.map((item) =>
            item.id === messageId
                ? { ...item, status: "pending", retries: 0 }
                : item
        );

        await this.#saveQueue(queue);
        await this.process();
    }

    // -------------------------
    // CLEAR QUEUE (optional admin/debug)
    // -------------------------
    async clear() {
        await this.#saveQueue([]);
    }
}
