export function renderUpgradeCards(choices) {
  return `
    <div class="upgrade-grid">
      ${choices.map((choice, index) => `
        <button class="upgrade-card" data-upgrade="${choice.id}">
          <span class="upgrade-number">${index + 1}</span>
          <span class="upgrade-rarity">${choice.rarity}</span>
          <strong>${choice.name}</strong>
          <span>${choice.description}</span>
          <small>${renderMeta(choice)}</small>
        </button>
      `).join("")}
    </div>
  `;
}

function renderMeta(choice) {
  if (Number.isFinite(choice.stack) && Number.isFinite(choice.maxStacks)) {
    return `${choice.category} · ${choice.stack}/${choice.maxStacks}`;
  }
  return choice.category || choice.kind || "Bonus";
}
