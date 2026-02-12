export const authRoutes = [
    {
        name: 'Onboarding',
        getComponent: () => require('package/src/legacyApp/pages/Auth/Onboarding').default,
        options: { title: 'Onboarding', headerShown: false },
    },
    {
        name: 'PhoneEntry',
        getComponent: () => require('@features/auth/PhoneEntry/PhoneEntryScreen').default,
        options: { title: 'Phone Login', headerShown: false },
    },
    {
        name: 'OtpVerification',
        getComponent: () => require('@features/auth/OtpVerification/OtpVerificationScreen').default,
        options: { title: 'Verify Code', headerShown: false },
    }
    // {
    //     name: "Login",
    //     getComponent: () => require("@features/auth/Login/LoginScreen").default,
    //     options: {
    //         title: "Sign In",
    //         headerShown: false,
    //     },
    // },
    // {
    //     name: "SignUp",
    //     getComponent: () => require("@features/auth/SignUp/SignUpScreen").default,
    //     options: {
    //         title: "Sign In",
    //         headerShown: false,
    //     },
    // },
    // {
    //     name: "ChangePassword",
    //     getComponent: () => require("@features/auth/ChangePassword/ChangePasswordScreen").default,
    //     options: {
    //         title: "Change Password",
    //         headerShown: false,
    //     },
    // },
    // {
    //     name: "ForgotPassword",
    //     getComponent: () => require("@features/auth/ForgotPassword/ForgotPasswordScreen").default,
    //     options: {
    //         title: "Forgot Password",
    //         headerShown: false,
    //     },
    // },
    // {
    //     name: "EnterCode",
    //     getComponent: () => require("@features/auth/EnterCode/EnterCodeScreen").default,
    //     options: {
    //         title: "Enter Code",
    //         headerShown: false,
    //     },
    // }
];

