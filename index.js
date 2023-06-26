export default (root) => {
  let active = [];

  const frame = root.querySelector('[data-oversnap-frame]');
  const viewport = root.querySelector('[data-oversnap-viewport]');
  const scroll = root.querySelector('[data-oversnap-scroll]');
  const items = root.querySelectorAll('[data-oversnap-item]');
  const prev = root.querySelector('[data-oversnap-prev]');
  const next = root.querySelector('[data-oversnap-next]');
  const pages = root.querySelectorAll('[data-oversnap-page]');

  const nav = (index) => {
    const item = items[index];

    if (item) {
      const dir = getComputedStyle(scroll).getPropertyValue('flex-direction');
      const align = getComputedStyle(item).getPropertyValue('scroll-snap-align');

      let x = 0;
      let y = 0;

      if (dir === 'row') {
        switch (align) {
          case 'start':
            x = item.offsetLeft;
            break;
          case 'end':
            x = item.offsetLeft - (scroll.offsetWidth - item.offsetWidth);
            break;
          case 'center':
            x = item.offsetLeft - (scroll.offsetWidth - item.offsetWidth) / 2;
            break;
        }
      }

      if (dir === 'column') {
        switch (align) {
          case 'start':
            y = item.offsetTop;
            break;
          case 'end':
            y = item.offsetTop - (scroll.offsetHeight - item.offsetHeight);
            break;
          case 'center':
            y = item.offsetTop - (scroll.offsetHeight - item.offsetHeight) / 2;
            break;
        }
      }

      scroll.scroll(x, y);
    }
  };

  const inertObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const { target, isIntersecting } = entry;

      if (isIntersecting) {
        target.removeAttribute('inert');
      } else {
        target.setAttribute('inert', '');
      }
    });
  }, {
    root: frame ?? scroll,
    rootMargin: '1px',
    threshold: 1,
  });

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const { target, isIntersecting } = entry;
      const index = [...items].indexOf(target);
      const start = index === 0;
      const end = index === items.length - 1;

      if (isIntersecting) {
        active.push(index);
        target.setAttribute('data-oversnap-item', 'active');
        pages[index]?.setAttribute('data-oversnap-page', 'active');
        start && prev?.setAttribute('disabled', '');
        end && next?.setAttribute('disabled', '');
      } else {
        active = active.filter((i) => i !== index);
        target.setAttribute('data-oversnap-item', '');
        pages[index]?.setAttribute('data-oversnap-page', '');
        start && prev?.removeAttribute('disabled');
        end && next?.removeAttribute('disabled');
      }

      active = [...new Set(active)].sort((a, b) => a - b);
      root.dispatchEvent(new CustomEvent('change', {
        detail: {
          items,
          active,
        },
      }));
    });
  }, {
    root: viewport ?? scroll,
    rootMargin: '1px',
    threshold: 1,
  });

  items.forEach((item) => {
    inertObserver.observe(item);
    activeObserver.observe(item);
  });

  if (prev) {
    prev.addEventListener('click', () => {
      const index = active[0] - 1;
      nav(index);
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      const index = active[active.length - 1] + 1;
      nav(index);
    });
  }

  pages.forEach((page, index) => {
     page.addEventListener('click', () => {
       nav(index);
     });
  });
};
