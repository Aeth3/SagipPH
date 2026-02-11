export const authRoutes = [
    {
        name: "Login",
        getComponent: () => require("@features/auth/Login/LoginScreen").default,
        options: {
            title: "Sign In",
            headerShown: false,
        },
    },
    {
        name: "SignUp",
        getComponent: () => require("@features/auth/SignUp/SignUpScreen").default,
        options: {
            title: "Sign In",
            headerShown: false,
        },
    },
    {
        name: "ChangePassword",
        getComponent: () => require("@features/auth/ChangePassword/ChangePasswordScreen").default,
        options: {
            title: "Change Password",
            headerShown: false,
        },
    },
    {
        name: "ForgotPassword",
        getComponent: () => require("@features/auth/ForgotPassword/ForgotPasswordScreen").default,
        options: {
            title: "Forgot Password",
            headerShown: false,
        },
    },
    {
        name: "EnterCode",
        getComponent: () => require("@features/auth/EnterCode/EnterCodeScreen").default,
        options: {
            title: "Enter Code",
            headerShown: false,
        },
    }
];

