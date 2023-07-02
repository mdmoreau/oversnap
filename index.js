export default (root) => {
  const viewport = root.querySelector('[data-oversnap-viewport]');
  const scroll = root.querySelector('[data-oversnap-scroll]');
  const items = root.querySelectorAll('[data-oversnap-item]');
  const prev = root.querySelector('[data-oversnap-prev]');
  const next = root.querySelector('[data-oversnap-next]');
  const pages = root.querySelectorAll('[data-oversnap-page]');

  let active = [];

  const align = () => {
    return getComputedStyle(items[0]).getPropertyValue('scroll-snap-align');
  };

  const nav = (index) => {
    const item = items[index];

    if (item) {
      const dir = getComputedStyle(scroll).getPropertyValue('flex-direction');
      const alignment = align();

      let x, y;

      if (dir === 'row') {
        const start = parseInt(getComputedStyle(scroll).getPropertyValue('scroll-padding-left'), 10);
        const end = parseInt(getComputedStyle(scroll).getPropertyValue('scroll-padding-right'), 10);

        switch (alignment) {
          case 'start':
            x = item.offsetLeft - start;
            break;
          case 'end':
            x = item.offsetLeft + end - (scroll.offsetWidth - item.offsetWidth);
            break;
          case 'center':
            x = item.offsetLeft - (scroll.offsetWidth - item.offsetWidth) / 2;
            break;
        }
      }

      if (dir === 'column') {
        const start = parseInt(getComputedStyle(scroll).getPropertyValue('scroll-padding-top'), 10);
        const end = parseInt(getComputedStyle(scroll).getPropertyValue('scroll-padding-bottom'), 10);

        switch (alignment) {
          case 'start':
            y = item.offsetTop - start;
            break;
          case 'end':
            y = item.offsetTop + end - (scroll.offsetHeight - item.offsetHeight);
            break;
          case 'center':
            y = item.offsetTop - (scroll.offsetHeight - item.offsetHeight) / 2;
            break;
        }
      }

      scroll.scroll(x, y);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const { target, isIntersecting } = entry;
      const index = [...items].indexOf(target);
      const start = index === 0;
      const end = index === items.length - 1;

      if (isIntersecting) {
        active.push(index);
        target.removeAttribute('inert');
        target.setAttribute('data-oversnap-item', 'active');
        pages[index]?.setAttribute('data-oversnap-page', 'active');
        start && prev?.setAttribute('disabled', '');
        end && next?.setAttribute('disabled', '');
      } else {
        active = active.filter((i) => i !== index);
        target.setAttribute('inert', '');
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
    observer.observe(item);
  });

  if (prev) {
    prev.addEventListener('click', () => {
      const alignment = align();

      let index;

      switch (alignment) {
        case 'start':
          index = active[0] - 1;
          break;
        case 'end':
          index = active[active.length - 1] - 1;
          break;
        case 'center':
          index = active[Math.floor(active.length / 2)] - 1;
          break;
      }

      nav(index);
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      const alignment = align();

      let index;

      switch (alignment) {
        case 'start':
          index = active[0] + 1;
          break;
        case 'end':
          index = active[active.length - 1] + 1;
          break;
        case 'center':
          index = active[Math.floor(active.length / 2)] + 1;
          break;
      }

      nav(index);
    });
  }

  pages.forEach((page, index) => {
     page.addEventListener('click', () => {
       nav(index);
     });
  });
};
