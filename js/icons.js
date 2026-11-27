window.createLumiereIcons = function () {
  const paths = {
    'christmas-tree': [
      '<path d="M12 3l4 4l-2 1l4 4l-3 1l4 4h-14l4 -4l-3 -1l4 -4l-2 -1l4 -4" />',
      '<path d="M14 17v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-3" />'
    ],
    sparkles: [
      '<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" />'
    ],
    typography: [
      '<path d="M4 20l3 0" />',
      '<path d="M14 20l7 0" />',
      '<path d="M6.9 15l6.9 0" />',
      '<path d="M10.2 6.3l5.8 13.7" />',
      '<path d="M5 20l6 -16l2 0l7 16" />'
    ],
    refresh: [
      '<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />',
      '<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />'
    ],
    music: [
      '<path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />',
      '<path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />',
      '<path d="M9 17v-13h10v13" />',
      '<path d="M9 8h10" />'
    ],
    gift: [
      '<path d="M3 9a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1l0 -2" />',
      '<path d="M12 8l0 13" />',
      '<path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" />',
      '<path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5" />'
    ],
    palette: [
      '<path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25" />',
      '<path d="M7.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />',
      '<path d="M11.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />',
      '<path d="M15.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />'
    ],
    movie: [
      '<path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />',
      '<path d="M8 4l0 16" /><path d="M16 4l0 16" />',
      '<path d="M4 8l4 0" /><path d="M4 16l4 0" />',
      '<path d="M4 12l16 0" /><path d="M16 8l4 0" /><path d="M16 16l4 0" />'
    ],
    'dice-5': [
      '<path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14" />',
      '<path d="M8 8.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />',
      '<path d="M15 8.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />',
      '<path d="M15 15.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />',
      '<path d="M8 15.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />',
      '<path d="M11.5 12a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />'
    ],
    x: [
      '<path d="M18 6l-12 12" /><path d="M6 6l12 12" />'
    ],
    star: [
      '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />'
    ],
    heart: [
      '<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />'
    ],
    snowflake: [
      '<path d="M10 4l2 1l2 -1" /><path d="M12 2v6.5l3 1.72" />',
      '<path d="M17.928 6.268l.134 2.232l1.866 1.232" /><path d="M20.66 7l-5.629 3.25l.01 3.458" />',
      '<path d="M19.928 14.268l-1.866 1.232l-.134 2.232" /><path d="M20.66 17l-5.629 -3.25l-2.99 1.738" />',
      '<path d="M14 20l-2 -1l-2 1" /><path d="M12 22v-6.5l-3 -1.72" />',
      '<path d="M6.072 17.732l-.134 -2.232l-1.866 -1.232" /><path d="M3.34 17l5.629 -3.25l-.01 -3.458" />',
      '<path d="M4.072 9.732l1.866 -1.232l.134 -2.232" /><path d="M3.34 7l5.629 3.25l2.99 -1.738" />'
    ],
    crown: [
      '<path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4l4 -6" />'
    ],
    camera: [
      '<path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />',
      '<path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />'
    ],
    video: [
      '<path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4" />',
      '<path d="M3 8a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -8" />'
    ],
    link: [
      '<path d="M9 15l6 -6" />',
      '<path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />',
      '<path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />'
    ],
    download: [
      '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />',
      '<path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" />'
    ],
    upload: [
      '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />',
      '<path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" />'
    ],
    eye: [
      '<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />',
      '<path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />'
    ],
    copy: [
      '<path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" />',
      '<path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />'
    ],
    plus: [
      '<path d="M12 5l0 14" /><path d="M5 12l14 0" />'
    ],
    photo: [
      '<path d="M15 8h.01" />',
      '<path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12" />',
      '<path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />',
      '<path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />'
    ],
    'player-play': [
      '<path d="M7 4v16l13 -8l-13 -8" />'
    ],
    'player-pause': [
      '<path d="M6 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12" />',
      '<path d="M14 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12" />'
    ],
    volume: [
      '<path d="M15 8a5 5 0 0 1 0 8" /><path d="M17.7 5a9 9 0 0 1 0 14" />',
      '<path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />'
    ],
    spiral: [
      '<path d="M10 12.057a1.9 1.9 0 0 0 .614 .743c1.06 .713 2.472 .112 3.043 -.919c.839 -1.513 -.022 -3.368 -1.525 -4.08c-2 -.95 -4.371 .154 -5.24 2.086c-1.095 2.432 .29 5.248 2.71 6.246c2.931 1.208 6.283 -.418 7.438 -3.255c1.36 -3.343 -.557 -7.134 -3.896 -8.41c-3.855 -1.474 -8.2 .68 -9.636 4.422c-1.63 4.253 .823 9.024 5.082 10.576c4.778 1.74 10.118 -.941 11.833 -5.59a9.354 9.354 0 0 0 .577 -2.813" />'
    ],
    'christmas-ball': [
      '<path d="M4 13a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />',
      '<path d="M11 5l1 -2l1 2" />',
      '<path d="M4.512 10.161c2.496 -1.105 4.992 -.825 7.488 .839c2.627 1.752 5.255 1.97 7.882 .653" />',
      '<path d="M4.315 15.252c2.561 -1.21 5.123 -.96 7.685 .748c2.293 1.528 4.585 1.889 6.878 1.081" />'
    ],
    ripple: [
      '<path d="M3 7c3 -2 6 -2 9 0s6 2 9 0" />',
      '<path d="M3 17c3 -2 6 -2 9 0s6 2 9 0" />',
      '<path d="M3 12c3 -2 6 -2 9 0s6 2 9 0" />'
    ],
    meteor: [
      '<path d="M21 3l-5 9h5l-6.891 7.086a6.5 6.5 0 1 1 -8.855 -9.506l7.746 -6.58l-1 5l9 -5" />',
      '<path d="M7 14.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />'
    ],
    rainbow: [
      '<path d="M22 17c0 -5.523 -4.477 -10 -10 -10c-5.523 0 -10 4.477 -10 10" />',
      '<path d="M18 17a6 6 0 1 0 -12 0" /><path d="M14 17a2 2 0 1 0 -4 0" />'
    ],
    mail: [
      '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />',
      '<path d="M3 7l9 6l9 -6" />'
    ]
  };

  function svg(name) {
    return '<svg class="ui-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      (paths[name] || paths.sparkles).join('') + '</svg>';
  }

  function render(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(element => {
      if (!element.querySelector(':scope > .ui-icon')) {
        element.insertAdjacentHTML('afterbegin', svg(element.dataset.icon));
      }
    });
  }

  function set(element, name, label) {
    element.dataset.icon = name;
    element.innerHTML = svg(name) + '<span class="icon-text"></span>';
    element.querySelector('.icon-text').textContent = label;
  }

  return { svg, render, set };
};

window.LumiereIcons = window.createLumiereIcons();
