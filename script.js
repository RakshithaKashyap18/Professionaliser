const input = document.getElementById("inputText");
const signature = document.getElementById("signatureText");
const output = document.getElementById("outputText");
const counter = document.getElementById("wordCount");

let typingTimer;
const delay = 500; // ms

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// Detect typing in both fields
input.addEventListener("input", handleTyping);
signature.addEventListener("input", handleTyping);

function handleTyping() {
  let text = input.value;
  const words = countWords(text);

  counter.textContent = `${words} / 200 words`;

  // Enforce 200-word limit
  if (words > 200) {
    const trimmed = text.split(/\s+/).slice(0, 200).join(" ");
    input.value = trimmed;
    counter.style.color = "red";
    return;
  } else {
    counter.style.color = "#666";
  }

  // Auto-run rewriting (debounced)
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => rewriteText(input.value, signature.value), delay);
}

async function rewriteText(text, signatureText) {
  if (!text.trim()) {
    output.textContent = "Your professional version will appear here automatically.";
    return;
  }

  output.textContent = "Rewriting...";

  try {
    const res = await fetch("/api/professionalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        signature: signatureText.trim()
      })
    });

    const data = await res.json();
    output.innerHTML = `
  <div class="rewritten-text">${data.professionalText}</div>
  <div class="signature-display">— ${data.signature || ""}</div>
`;

  } catch (err) {
    output.textContent = "Error: Could not rewrite text.";
  }
}
document.getElementById("copyBtn").addEventListener("click", () => {
  const text = output.innerText; // gets ONLY text inside output box

  navigator.clipboard.writeText(text)
    .then(() => {
      alert("Copied to clipboard!");
    })
    .catch(err => {
      console.error("Copy failed:", err);
    });
});
