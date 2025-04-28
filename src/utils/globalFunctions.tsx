import OpenAI from "openai";

export const formatDate = (fechaISO: string): string => {
    const date = new Date(fechaISO);
    const today = new Date();
    const ayer = new Date(today);
    ayer.setDate(today.getDate() - 1);

    const itsToday = date.toDateString() === today.toDateString();
    const itsYesterday = date.toDateString() === ayer.toDateString();

    if (itsToday) {
        return "Today";
    } else if (itsYesterday) {
        return "Yesterday";
    } else {
        const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-US', opciones);
    }
};

export const generateOpenaiResponse = async (userMessage: string): Promise<string> => {
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_API_KEY_OPENAI,
        dangerouslyAllowBrowser: true,
    });
    try {
        const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        store: true,
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
        top_p: 0.89,
        });

        // Obtenemos el contenido y validamos que no sea null.
        const content = completion.choices[0].message.content;
        if (content === null) {
        throw new Error("La respuesta de OpenAI no contiene contenido.");
        }
        return content;
    } catch (error: unknown) {
        if (error instanceof Error) {
        console.error("Error:", error.message);
        } else {
        console.error("Unexpected error:", error);
        }
        throw error;
    }
};
