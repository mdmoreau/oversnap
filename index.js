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
      const dir = getComputedStyle(viewport).getPropertyValue('flex-direction');
      const align = getComputedStyle(item).getPropertyValue('scroll-snap-align');

      let x = 0;
      let y = 0;

      if (dir === 'row') {
        switch (align) {
          case 'start':
            x = item.offsetLeft;
            break;
          case 'end':
            x = item.offsetLeft - (viewport.offsetWidth - item.offsetWidth);
            break;
          case 'center':
            x = item.offsetLeft - (viewport.offsetWidth - item.offsetWidth) / 2;
            break;
        }
      }

      if (dir === 'column') {
        switch (align) {
          case 'start':
            y = item.offsetTop;
            break;
          case 'end':
            y = item.offsetTop - (viewport.offsetHeight - item.offsetHeight);
            break;
          case 'center':
            y = item.offsetTop - (viewport.offsetHeight - item.offsetHeight) / 2;
            break;
        }
      }

      viewport.scroll(x, y);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const { target, isIntersecting } = entry;
      const index = [...items].indexOf(target);
      const start = index === 0;
      const end = index === items.length - 1;

      if (isIntersecting) {
        visible.push(index);
        target.removeAttribute('inert');
        pages[index]?.setAttribute('data-oversnap-page', 'visible');
        start && prev?.setAttribute('disabled', 'disabled');
        end && next?.setAttribute('disabled', 'disabled');
      } else {
        visible = visible.filter((i) => i !== index);
        target.setAttribute('inert', '');
        pages[index]?.setAttribute('data-oversnap-page', '');
        start && prev?.removeAttribute('disabled');
        end && next?.removeAttribute('disabled');
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
