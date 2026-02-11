export const authRoutes = [
    {
        name: "Login",
        getComponent: () => require("../src/features/auth/Login/LoginScreen").default,
        options: {
            title: "Sign In",
            headerShown: false,
        },
    },
    {
        name: "SignUp",
        getComponent: () => require("../src/features/auth/SignUp/SignUpScreen").default,
        options: {
            title: "Sign In",
            headerShown: false,
        },
    },
    {
        name: "ChangePassword",
        getComponent: () => require("../src/features/auth/ChangePassword/ChangePasswordScreen").default,
        options: {
            title: "Change Password",
            headerShown: false,
        },
    },
    {
        name: "ForgotPassword",
        getComponent: () => require("../src/features/auth/ForgotPassword/ForgotPasswordScreen").default,
        options: {
            title: "Forgot Password",
            headerShown: false,
        },
    },
    {
        name: "EnterCode",
        getComponent: () => require("../src/features/auth/EnterCode/EnterCodeScreen").default,
        options: {
            title: "Enter Code",
            headerShown: false,
        },
    }
];

