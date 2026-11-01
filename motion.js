/* Shared, dependency-free motion. Content stays readable without JavaScript. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const allowed = () => !reduced.matches && pointer.matches;
  const animations = new Set();
  const track = animation => {
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
  };

  document.querySelectorAll('.motion-title').forEach(title => {
    // Preserve the original heading text for assistive technology.
    const text = title.textContent;
    title.setAttribute('aria-label', text);
    const words = text.trim().split(/\s+/);
    title.replaceChildren(...words.flatMap((word, index) => {
      const mask = document.createElement('span');
      mask.className = 'word-mask';
      mask.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = index === words.length - 1 ? 'title-accent' : '';
      inner.textContent = word;
      mask.append(inner);
      if (!reduced.matches) track(inner.animate([
        { transform: 'translateY(110%) rotate(3deg)', opacity: 0 },
        { transform: 'translateY(0) rotate(0)', opacity: 1 }
      ], { duration: 1000, delay: 100 + index * 120, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
      return index ? [document.createTextNode(' '), mask] : [mask];
    }));
  });

  const entrances = document.querySelectorAll('.hero-intro > :not(h1), .profile-summary > div, .hero-footer, .games-intro > :not(h1)');
  entrances.forEach((element, index) => {
    if (reduced.matches) return;
    track(element.animate([
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 800, delay: 80 + index * 65, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
  });

  reduced.addEventListener('change', () => {
    if (reduced.matches) animations.forEach(animation => animation.cancel());
  });
})();

/* Scroll position controls each sequence in both directions. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 720px)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const story = document.querySelector('.scroll-story');
  const statement = document.querySelector('.scroll-words');
  const track = document.querySelector('.discipline-track');
  let words = [];
  let cards = [];
  let frame = null;
  if (statement) {
    const text = statement.textContent;
    statement.setAttribute('aria-label', text);
    words = text.trim().split(/\s+/).map(word => {
      const span = document.createElement('span');
      span.className = 'scroll-word';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = word;
      return span;
    });
    statement.replaceChildren(...words.flatMap((word, index) => index ? [document.createTextNode(' '), word] : [word]));
  }
  function update() {
    frame = null;
    if (reduced.matches || document.hidden) return;
    const height = innerHeight;
    if (statement) {
      const bounds = statement.getBoundingClientRect();
      const progress = clamp((height * .9 - bounds.top) / (height * .55));
      words.forEach((word, index) => word.style.setProperty('--word-fill', `${clamp(progress * words.length - index) * 100}%`));
    }
    if (track && story) {
      const bounds = story.getBoundingClientRect();
      const progress = clamp((height - bounds.top) / (height + bounds.height));
      const travel = Math.max(0, track.scrollWidth - document.documentElement.clientWidth + 60);
      track.style.setProperty('--track-x', `${-progress * travel}px`);
    }
    // Only write styles for cards near the viewport; offscreen cards remain readable.
    cards.forEach((card, index) => {
      const bounds = card.getBoundingClientRect();
      // offsetTop avoids a feedback loop from the animated translate/scale.
      const top = card.offsetTop + card.offsetParent.getBoundingClientRect().top;
      if (bounds.bottom < -150 || top > height + 200) return;
      const progress = clamp((height - top) / (height * (compact.matches ? .22 : .3)));
      const remaining = 1 - progress;
      card.style.setProperty('--card-y', `${remaining * (compact.matches ? 28 : 70)}px`);
      card.style.setProperty('--card-scale', `${1 - remaining * .045}`);
      card.style.setProperty('--card-angle', `${compact.matches ? 0 : 0}deg`);
      card.style.setProperty('--card-opacity', `${.25 + progress * .75}`);
    });
  }
  function queue() {
    if (frame === null && !reduced.matches) frame = requestAnimationFrame(update);
  }
  function refresh() {
    cards = [...document.querySelectorAll('.scroll-card')];
    document.documentElement.classList.toggle('scroll-enabled', !reduced.matches);
    queue();
  }
  document.addEventListener('motion:refresh', refresh);
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  document.addEventListener('visibilitychange', queue);
  document.addEventListener('focusin', event => {
    const card = event.target.closest('.scroll-card');
    if (card) {
      ['--card-y', '--card-scale', '--card-angle', '--card-opacity'].forEach(name => card.style.removeProperty(name));
    }
  });
  reduced.addEventListener('change', refresh);
  compact.addEventListener('change', queue);
  refresh();
})();
