export function renderUpgradeCards(choices) {
  return `
    <div class="upgrade-grid">
      ${choices.map((choice, index) => `
        <button class="upgrade-card" data-upgrade="${choice.id}">
          <span class="upgrade-number">${index + 1}</span>
          <span class="upgrade-rarity">${choice.rarity}</span>
          <strong>${choice.name}</strong>
          <span>${choice.description}</span>
          <small>${choice.category} · ${choice.stack}/${choice.maxStacks}</small>
        </button>
      `).join("")}
    </div>
  `;
}
