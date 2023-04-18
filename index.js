export default (root) => {
  let visible = [];

  const viewport = root.querySelector('[data-oversnap-viewport]');
  const items = root.querySelectorAll('[data-oversnap-item]');
  const prev = root.querySelector('[data-oversnap-prev]');
  const next = root.querySelector('[data-oversnap-next]');
  const pages = root.querySelectorAll('[data-oversnap-page]');

  const nav = (index) => {
    const item = items[index];

    if (item) {
      const align = getComputedStyle(item).getPropertyValue('--align').trim();
      const options = {
        block: align,
        inline: align,
      };

      item.scrollIntoView(options);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const { target, isIntersecting } = entry;
      const index = [...items].indexOf(target);

      if (isIntersecting) {
        visible.push(index);
        target.removeAttribute('inert');
        pages[index].setAttribute('data-oversnap-page', 'visible');
      } else {
        visible = visible.filter((i) => i !== index);
        target.setAttribute('inert', '');
        pages[index].setAttribute('data-oversnap-page', '');
      }

      visible = [...new Set(visible)].sort((a, b) => a - b);
    });
  }, {
    root: viewport,
    rootMargin: '1px',
    threshold: 1,
  });

  items.forEach((item) => {
    observer.observe(item);
  });

  if (prev) {
    prev.addEventListener('click', () => {
      const index = visible[0] - 1;

      nav(index);
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      const index = visible[visible.length - 1] + 1;

      nav(index);
    });
  }

  pages.forEach((page, index) => {
     page.addEventListener('click', () => {
       nav(index);
     });
  });
};
