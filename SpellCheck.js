const PENALTY = {
    MATCH: 0,
    MISMATCH: {
        SIMILAR: 1,
        DISSIMILAR: 3
    },
    GAP: 2
};

// Helper functions to classify characters
const isVowel = char => "aeiou".includes(char.toLowerCase());
const isConsonant = char => char.match(/[a-z]/i) && !isVowel(char);

function calculatePenalty(word1, word2) {
    const m = word1.length;
    const n = word2.length;

    // Create DP table
    const dp = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0));

    // Initialize DP table
    for (let i = 0; i <= m; i++) dp[i][0] = i * PENALTY.GAP;
    for (let j = 0; j <= n; j++) dp[0][j] = j * PENALTY.GAP;

    // Fill DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const char1 = word1[i - 1];
            const char2 = word2[j - 1];

            const matchCost =
                char1 === char2
                    ? PENALTY.MATCH
                    : isVowel(char1) === isVowel(char2)
                    ? PENALTY.MISMATCH.SIMILAR
                    : PENALTY.MISMATCH.DISSIMILAR;

            dp[i][j] = Math.min(
                dp[i - 1][j - 1] + matchCost, // Substitution
                dp[i - 1][j] + PENALTY.GAP, // Deletion
                dp[i][j - 1] + PENALTY.GAP // Insertion
            );
        }
    }

    return dp[m][n];
}

async function spellCheck(inputWord) {
    // Load dictionary from dictionary.txt
    const response = await fetch("dictionary.txt");
    const dictionary = (await response.text()).split("\n").map(word => word.trim());

    // Calculate penalty scores for each word in the dictionary
    const scores = dictionary.map(word => ({
        word,
        penalty: calculatePenalty(inputWord, word)
    }));

    // Find the 10 words with the lowest scores
    scores.sort((a, b) => a.penalty - b.penalty);
    const topMatches = scores.slice(0, 10);

    // Display the results
    const resultsDiv = document.querySelector(".results");
    resultsDiv.innerHTML = `
        <h2>Suggestions for "${inputWord}":</h2>
        <ul>
            ${topMatches.map(match => `<li>${match.word} (Score: ${match.penalty})</li>`).join("")}
        </ul>
    `;
}

// Attach the spell check function to the form
document.querySelector(".spell-check-form").addEventListener("submit", event => {
    event.preventDefault();
    const inputWord = document.querySelector("#word-input").value.trim();
    if (inputWord) spellCheck(inputWord);
});
