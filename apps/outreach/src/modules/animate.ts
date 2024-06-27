export function animateUnorderedListEntry(id: string) {
  const ul = document.getElementById(id);
  if (!ul) {
    console.error(`Cannot find element with ID: ${id}`);
    return;
  }
  for (let i = 0; i < ul.children.length; i++) {
    const li = ul.children.item(i) as HTMLLIElement;
    setTimeout(() => {
      li.classList.replace('opacity-0', 'opacity-100');
      li.classList.replace('translate-y-6', 'translate-y-0');
    }, i * 100);
  }
}
