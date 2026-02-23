import { Message, MESSAGE_SENDERS } from "../../package/src/domain/entities/Message";

describe("Message.validateInput performance", () => {
  it("stays below baseline average execution time", () => {
    const iterations = 25000;
    const start = Date.now();

    for (let i = 0; i < iterations; i += 1) {
      const result = Message.validateInput({
        chatId: `chat-${i}`,
        sender: MESSAGE_SENDERS.USER,
        content: `Content ${i}`,
      });
      expect(result.ok).toBe(true);
    }

    const totalMs = Date.now() - start;
    const averageMsPerCall = totalMs / iterations;

    // Soft baseline to catch severe regressions without flaky failures in CI.
    expect(averageMsPerCall).toBeLessThan(0.2);
  });
});
