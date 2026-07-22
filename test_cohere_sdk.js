const { CohereClientV2 } = require('cohere-ai');
const cohere = new CohereClientV2({
    token: 'B3cWwL6b142010Lg5N9Knbh5m9sL6b14',
});

async function run() {
    try {
        console.log("Sending query to Cohere...");
        const response = await cohere.chat({
            model: "command-r-plus-08-2024",
            messages: [{ role: 'user', content: 'Hello' }],
            temperature: 0.7,
        });
        console.log("Response:", response);
    } catch (err) {
        console.error("Cohere Direct Error:");
        console.error(err);
    }
}
run();
