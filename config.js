document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("playerForm");
  const x = document.getElementById("playerX");
  const o = document.getElementById("playerO");

  // Preencher com últimos nomes usados (se houver)
  const lastX = localStorage.getItem("playerXName");
  const lastO = localStorage.getItem("playerOName");
  if (lastX) x.value = lastX;
  if (lastO) o.value = lastO;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameX = x.value.trim() || "Jogador X";
    const nameO = o.value.trim() || "Jogador O";
    localStorage.setItem("playerXName", nameX);
    localStorage.setItem("playerOName", nameO);
    // Vai para a página do jogo
    window.location.href = "index.html";
  });
});
