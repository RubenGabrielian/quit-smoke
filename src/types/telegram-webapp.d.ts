interface TelegramWebApp {
    ready(): void;
    expand(): void;
    MainButton: {
        setParams(params: { text: string; color: string }): void;
        showProgress(): void;
        hideProgress(): void;
    };
    showPopup(params: { title: string; message: string; buttons: Array<{ type: string }> }): void;
    initDataUnsafe: {
        user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
        };
    };
}

interface Window {
    Telegram?: {
        WebApp: TelegramWebApp;
    };
} 