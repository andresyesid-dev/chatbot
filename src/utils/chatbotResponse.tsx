import * as tf from '@tensorflow/tfjs';

// Datos de entrenamiento (cada par tiene una entrada y la respuesta completa)
const trainingData = [
    // Saludos
    { input: "hola", output: "¡Hola! ¿Cómo te encuentras hoy?" },
    { input: "buenas", output: "¡Muy buenas! Espero que todo esté bien." },
    { input: "qué hay de nuevo", output: "¡Hola! No mucho, pero cuéntame de ti." },
    { input: "hola me recuerdas", output: "¡Claro que sí! Siempre estoy aquí para ti." },
    { input: "hey", output: "¡Hey! ¿Qué tal va tu día?" },

    // Mis estados
    { input: "me siento bien", output: "¡Qué alegría saber que te sientes bien!" },
    { input: "comprendo", output: "¡Perfecto! Me alegra que lo hayas entendido." },
    { input: "muy bien, gracias", output: "¡Genial! Me alegra mucho saber que estás bien." },
    { input: "aburrido", output: "Lamento que te sientas aburrido. ¿Qué puedo hacer para animarte?" },
    { input: "no entiendo", output: "Lamento que no te haya quedado claro. ¿Necesitas algo más?" },

    // Mis estados
    { input: "Que es un chatbot", output: "Un chatbot es un programa de inteligencia artificial diseñado para simular una conversación humana." },
    { input: "En qué estás hecho", output: "Estoy construido con tecnologías modernas, usando TensorFlow para la inteligencia artificial y TypeScript para robustecer mi lógica." },
    { input: "Me entiendes", output: "Te entiendo perfectamente. ¿En qué puedo ayudarte hoy?" },
    { input: "para qué fuiste creado", output: "Fui creado para demostrar mis habilidades en XUM TECH y para asistirte de la mejor manera. ¿Qué necesitas?" },

    // Despedidas
    { input: "nos vemos pronto", output: "¡Nos vemos pronto! Cuídate." },
    { input: "chao", output: "¡Chao! Que tengas un excelente día." },
    { input: "adios", output: "¡Adiós! Espero verte de nuevo pronto." },
    { input: "hasta luego", output: "¡Nos vemos! Que tengas un buen descanso." },

    // Preguntas sobre humor
    { input: "cuéntame un chiste", output: "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!" },
    { input: "sabes un chiste", output: "¿Sabes por qué el libro de matemáticas estaba triste? ¡Porque tenía demasiados problemas!" },
    { input: "quiero reírme", output: "¿Cuántos programadores se necesitan para cambiar un bombillo? Ninguno, ¡es un problema de hardware!" },
    { input: "dime algo gracioso", output: "¿Cuál es el colmo de Batman? Que le Robin. " },


    // Conversaciones casuales
    { input: "qué día es hoy", output: "Hoy es domingo. ¿Qué planes tienes?" },
    { input: "qué hora es", output: "Son las 8:45 PM en tu zona horaria. ¿Necesitas hacer algo ahora?" },
    { input: "qué estás haciendo", output: "Estoy respondiendo tus preguntas para ayudarte." },
    { input: "qué te gusta hacer", output: "Me gusta hablar contigo y aprender más de tus ideas." },
    { input: "qué clima hace", output: "Espero que esté agradable. ¿Cómo se siente afuera?" },

    { input: "tienes nombre", output: "Me llaman chatbot. ¿Tú cómo te llamas?" },
    { input: "tienes amigos", output: "¡Claro que sí! Cada usuario es especial para mí." },

    // Palabras clave
    { input: "tiempo", output: "Son las 8:45 PM en tu zona horaria. ¿Necesitas hacer algo ahora?" },
    { input: "clima", output: "Espero que esté agradable. ¿Cómo se siente afuera?" },
    { input: "chiste", output: "¿Qué le dice el número 1 al número 10? Para ser como yo, tienes que ser sincero." },
    { input: "chatbot", output: "Un chatbot es un programa de inteligencia artificial diseñado para simular una conversación humana." },
];


// Creamos una lista de respuestas únicas (cada una será una clase)
const responses: string[] = Array.from(new Set(trainingData.map(item => item.output)));

// Creamos un vocabulario únicamente para las entradas
const vocabSet: Set<string> = new Set(["<PAD>"]);
trainingData.forEach(({ input }) => {
    input.split(' ').forEach((word: string) => vocabSet.add(word.toLowerCase()));
});
const vocabArray: string[] = Array.from(vocabSet);

// Creamos el mapeo de palabra a índice para las entradas
const wordIndex: { [key: string]: number } = Object.fromEntries(
    vocabArray.map((word, i) => [word, i])
);

// Funciones auxiliares para procesar frases
const sentenceToIndices = (sentence: string): number[] =>
     sentence.toLowerCase().split(' ').map((word: string) => wordIndex[word] || wordIndex["<PAD>"]);

const padSequence = (seq: number[], maxLen: number): number[] =>
    seq.concat(Array(maxLen - seq.length).fill(wordIndex["<PAD>"])).slice(0, maxLen);

const maxLen: number = 5; // Longitud máxima para las entradas

// Se crea un modelo que clasifica entre respuestas completas (las clases serán "0", "1", "2", etc)
function createModel(vocabSize: number, numResponses: number): tf.Sequential {
    const model = tf.sequential();
    model.add(tf.layers.embedding({ inputDim: vocabSize, outputDim: 24, inputLength: maxLen }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 24, activation: 'relu' }));
    // La capa final tiene tantas neuronas como respuestas (clases)
    model.add(tf.layers.dense({ units: numResponses, activation: 'softmax' }));
    model.compile({ optimizer: 'adam', loss: 'sparseCategoricalCrossentropy' });
    return model;
}

const model = createModel(vocabArray.length, responses.length);

// Preparamos los tensores de entrada y salida
const inputTensors = tf.tensor2d(
    trainingData.map(item => padSequence(sentenceToIndices(item.input), maxLen))
);
const outputTensors = tf.tensor1d(
    trainingData.map(item => responses.indexOf(item.output)),
    'float32'
);

// Función para entrenar el modelo
async function trainModel(): Promise<void> {
    await model.fit(inputTensors, outputTensors, { epochs: 150 });
}

// Función de inferencia: se procesa la entrada y se devuelve la respuesta completa asociada
async function getResponse(inputText: string): Promise<string> {
    const paddedInput = padSequence(sentenceToIndices(inputText), maxLen);
    const inputIndices = tf.tensor2d([paddedInput]);
    const predictionResult = model.predict(inputIndices);

    // Aseguramos que trabajamos con un objeto tf.Tensor
    let predictionTensor: tf.Tensor;
    if (Array.isArray(predictionResult)) {
        predictionTensor = predictionResult[0];
    } else {
        predictionTensor = predictionResult as tf.Tensor;
    }

    const predictedIndex = predictionTensor.argMax(-1).dataSync()[0] as number;
    return responses[predictedIndex];
}

export const generateChatbotResponse = async (input: string): Promise<string> => {
    await trainModel();
    const response = await getResponse(input);
    return response;
};
