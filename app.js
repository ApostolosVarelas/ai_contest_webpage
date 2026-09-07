(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  const nav = document.getElementById("primary-nav");
  const navToggle = document.querySelector(".nav-toggle");

  function validPanelName(value) {
    return panels.some((panel) => panel.dataset.panel === value) ? value : "home";
  }

  function activatePanel(name, options) {
    const settings = Object.assign({ focus: false, updateHash: true }, options);
    const target = validPanelName(name);

    tabs.forEach((tab) => {
      const active = tab.dataset.tab === target;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && settings.focus) tab.focus();
    });

    panels.forEach((panel) => {
      const active = panel.dataset.panel === target;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });

    if (target !== "demo") {
      document.querySelectorAll("[data-clip-panel] video").forEach((video) => video.pause());
    }

    if (settings.updateHash && window.location.hash !== `#${target}`) {
      history.pushState(null, "", `#${target}`);
    }

    document.body.dataset.page = target;
    document.title = target === "home"
      ? "LLM-Driven Mission Control | AI Beauty Contest 2026"
      : `${tabs.find((tab) => tab.dataset.tab === target).textContent.trim()} | LLM-Driven Mission Control`;

    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activatePanel(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      activatePanel(tabs[next].dataset.tab, { focus: true });
    });
  });

  document.querySelectorAll("[data-tab-target]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      activatePanel(control.dataset.tabTarget);
    });
  });

  const clipTabs = Array.from(document.querySelectorAll("[data-clip-tab]"));
  const clipPanels = Array.from(document.querySelectorAll("[data-clip-panel]"));
  const clipExplorer = document.querySelector(".clip-explorer");
  let clipExplorerVisible = false;

  function syncClipPlayback() {
    clipPanels.forEach((panel) => {
      const video = panel.querySelector("video");
      if (!video) return;
      const shouldPlay = panel.classList.contains("is-active")
        && clipExplorerVisible
        && document.body.dataset.page === "demo"
        && !document.hidden;
      if (shouldPlay) video.play().catch(() => {});
      else video.pause();
    });
  }

  function activateClip(name, options) {
    const settings = Object.assign({ focus: false }, options);
    const target = clipPanels.some((panel) => panel.dataset.clipPanel === name)
      ? name
      : clipPanels[0]?.dataset.clipPanel;

    if (!target) return;

    clipTabs.forEach((tab) => {
      const active = tab.dataset.clipTab === target;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && settings.focus) tab.focus();
    });

    clipPanels.forEach((panel) => {
      const active = panel.dataset.clipPanel === target;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
      if (!active) panel.querySelector("video")?.pause();
    });

    syncClipPlayback();
  }

  clipTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateClip(tab.dataset.clipTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowLeft") next = (index - 1 + clipTabs.length) % clipTabs.length;
      if (event.key === "ArrowRight") next = (index + 1) % clipTabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = clipTabs.length - 1;
      activateClip(clipTabs[next].dataset.clipTab, { focus: true });
    });
  });

  document.querySelectorAll("[data-clip-previous], [data-clip-next]").forEach((control) => {
    control.addEventListener("click", () => {
      const current = clipTabs.findIndex((tab) => tab.classList.contains("is-active"));
      const direction = control.hasAttribute("data-clip-previous") ? -1 : 1;
      const next = (current + direction + clipTabs.length) % clipTabs.length;
      activateClip(clipTabs[next].dataset.clipTab);
      const focusTarget = clipPanels[next].querySelector(direction < 0 ? "[data-clip-previous]" : "[data-clip-next]");
      focusTarget?.focus({ preventScroll: true });
    });
  });

  if (clipExplorer && "IntersectionObserver" in window) {
    const clipObserver = new IntersectionObserver((entries) => {
      clipExplorerVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35);
      syncClipPlayback();
    }, { threshold: [0, 0.35] });
    clipObserver.observe(clipExplorer);
  } else if (clipExplorer) {
    clipExplorerVisible = true;
  }

  document.addEventListener("visibilitychange", syncClipPlayback);

  navToggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  window.addEventListener("popstate", () => {
    activatePanel(window.location.hash.slice(1), { updateHash: false });
  });

  document.querySelectorAll("[data-team-name]").forEach((element) => {
    element.textContent = config.teamName || "Duckster Team";
  });

  const memberList = document.querySelector("[data-team-members]");
  if (memberList && Array.isArray(config.teamMembers)) {
    memberList.replaceChildren(...config.teamMembers.map((member) => {
      const details = typeof member === "string"
        ? { name: member, linkedin: "", photo: "" }
        : member;
      const item = document.createElement(details.linkedin ? "a" : "span");
      item.className = "member-card";
      if (details.linkedin) {
        item.href = details.linkedin;
        item.target = "_blank";
        item.rel = "noopener noreferrer";
      }

      const photoFrame = document.createElement("span");
      photoFrame.className = "member-photo";
      if (details.photo) {
        const photo = document.createElement("img");
        photo.src = details.photo;
        photo.alt = details.photoAlt || `Portrait of ${details.name}`;
        photoFrame.append(photo);
      }

      const copy = document.createElement("span");
      copy.className = "member-details";
      const label = document.createElement("small");
      label.textContent = "Team member";
      const name = document.createElement("strong");
      name.textContent = details.name;
      const profile = document.createElement("span");
      profile.textContent = details.linkedin ? "LinkedIn profile " : "Profile";
      if (details.linkedin) {
        const externalMark = document.createElement("i");
        externalMark.setAttribute("aria-hidden", "true");
        externalMark.textContent = "↗";
        profile.append(externalMark);
      }
      copy.append(label, name, profile);
      item.append(photoFrame, copy);
      return item;
    }));
  }

  document.querySelectorAll("[data-full-demo-link]").forEach((link) => {
    if (config.fullDemoUrl) link.href = config.fullDemoUrl;
  });

  Object.entries(config.kpis || {}).forEach(([key, value]) => {
    const element = document.querySelector(`[data-kpi="${key}"]`);
    if (element && value !== null && value !== "") element.textContent = value;
  });

  const copyButton = document.querySelector("[data-copy-command]");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const command = copyButton.parentElement.querySelector("code").textContent;
      try {
        await navigator.clipboard.writeText(command);
        copyButton.textContent = "Copied";
        window.setTimeout(() => { copyButton.textContent = "Copy command"; }, 1600);
      } catch (_) {
        copyButton.textContent = "Select and copy manually";
      }
    });
  }

  activatePanel(window.location.hash.slice(1), { updateHash: false });
  activateClip("operation");
})();
