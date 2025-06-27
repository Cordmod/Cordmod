// Discord Web Animated Status - GUI Version (Improved Layout)
// WARNING: Use at your own risk. This may violate Discord's ToS.

class WebAnimatedStatusGUI {
  constructor() {
    this.kMinTimeout = 2900;
    this.cancel = undefined;
    this.animation = [];
    this.timeout = this.kMinTimeout;
    this.randomize = false;
    this.loop = undefined;
    this.isRunning = false;
    this.rawMode = false;
    this.savedAnimationData = null; // For persistence across GUI reopens
    
    // Get Discord's webpack modules
    this.getDiscordModules();
    
    // Create GUI
    this.createGUI();
  }

  getDiscordModules() {
    try {
      // Find Discord's webpack
      let webpackChunk = window.webpackChunkdiscord_app;
      
      if (!webpackChunk) {
        console.error("Discord webpack not found. Make sure you're on Discord web.");
        return;
      }

      // Extract modules - use exact same method as original
      let modules = [];
      webpackChunk.push([['WebAnimatedStatus'], {}, e => {
        modules = modules.concat(Object.values(e.c || {}));
      }]);

      // Find token and user modules - exact same logic as original
      const tokenModule = modules.find(m => m.exports?.default?.getToken?.name === "getToken");
      const userModule = modules.find(m => m.exports?.default?.getCurrentUser?.name === "getCurrentUser");

      if (!tokenModule || !userModule) {
        console.error("Required Discord modules not found");
        console.log("Available modules:", modules.length);
        // Try alternative search if exact match fails
        const altTokenModule = modules.find(m => m.exports?.default?.getToken);
        const altUserModule = modules.find(m => m.exports?.default?.getCurrentUser);
        
        if (altTokenModule && altUserModule) {
          this.authToken = altTokenModule.exports.default.getToken();
          this.currentUser = altUserModule.exports.default.getCurrentUser();
          console.log("Discord modules loaded with alternative method");
          return;
        }
        return;
      }

      this.authToken = tokenModule.exports.default.getToken();
      this.currentUser = userModule.exports.default.getCurrentUser();
      
      console.log("Discord modules loaded successfully");
      console.log("Token found:", !!this.authToken);
    } catch (error) {
      console.error("Failed to get Discord modules:", error);
    }
  }

  // Improved theme detection
  detectTheme() {
    // Multiple methods to detect Discord's dark theme
    const themeDetectors = [
      () => document.documentElement.classList.contains('theme-dark'),
      () => document.body.classList.contains('theme-dark'),
      () => !!document.querySelector('[class*="theme-dark"]'),
      () => {
        const bgColor = getComputedStyle(document.body).backgroundColor;
        return bgColor.includes('54, 57, 63') || bgColor.includes('35, 39, 42');
      },
      () => {
        const primaryBg = getComputedStyle(document.documentElement).getPropertyValue('--background-primary');
        return primaryBg && (primaryBg.includes('54') || primaryBg.includes('35'));
      },
      () => {
        // Check for Discord's CSS variables
        const style = getComputedStyle(document.documentElement);
        const bg = style.getPropertyValue('--bg-overlay-1') || style.getPropertyValue('--primary-630');
        return bg && bg.trim() !== '';
      }
    ];

    return themeDetectors.some(detector => {
      try { return detector(); } catch { return false; }
    });
  }

  // Get theme-aware colors
  getThemeColors() {
    const isDark = this.detectTheme();
    
    return {
      isDark,
      // Background colors
      modalBg: isDark ? '#36393f' : '#ffffff',
      inputBg: isDark ? '#40444b' : '#f6f6f6',
      sectionBg: isDark ? '#2f3136' : '#f2f3f5',
      
      // Text colors
      primaryText: isDark ? '#dcddde' : '#2e3338',
      secondaryText: isDark ? '#b9bbbe' : '#747f8d',
      mutedText: isDark ? '#72767d' : '#99aab5',
      
      // Accent colors
      success: '#43b581',
      danger: '#f04747',
      primary: '#5865f2',
      
      // Borders and shadows
      shadow: 'rgba(0, 0, 0, 0.24)',
      overlayBg: 'rgba(0, 0, 0, 0.8)'
    };
  }

  createGUI() {
    // Check if GUI already exists
    if (document.getElementById('animated-status-gui')) {
      document.getElementById('animated-status-gui').remove();
    }

    const colors = this.getThemeColors();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'animated-status-gui';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${colors.overlayBg};
      z-index: 10000;
      display: grid;
      place-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Create modal with CSS Grid layout - fullscreen
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: ${colors.modalBg};
      color: ${colors.primaryText};
      border-radius: 8px;
      padding: 24px;
      width: 90vw;
      max-width: 800px;
      height: 85vh;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 16px ${colors.shadow};
      display: grid;
      grid-template-rows: auto auto 1fr auto auto;
      gap: 20px;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
    `;

    const title = document.createElement('h2');
    title.textContent = 'ANIMATEDSTATUS SETTINGS';
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      text-transform: uppercase;
      color: ${colors.primaryText};
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: ${colors.secondaryText};
      padding: 0;
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.backgroundColor = colors.sectionBg;
    closeBtn.onmouseout = () => closeBtn.style.backgroundColor = 'transparent';
    closeBtn.onclick = () => overlay.remove();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create step-time section with grid layout
    const stepTimeSection = document.createElement('div');
    stepTimeSection.style.cssText = `
      display: grid;
      gap: 8px;
    `;

    const stepTimeLabel = document.createElement('label');
    stepTimeLabel.textContent = 'STEP-TIME (MILLISECONDS)';
    stepTimeLabel.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: ${colors.secondaryText};
      text-transform: uppercase;
    `;

    const stepTimeHelp = document.createElement('div');
    stepTimeHelp.textContent = 'Minimum: 2900ms (2.9s) - Recommended: 10000ms (10s) for smooth animation';
    stepTimeHelp.style.cssText = `
      font-size: 11px;
      color: ${colors.mutedText};
      line-height: 1.3;
    `;

    const stepTimeInput = document.createElement('input');
    stepTimeInput.type = 'number';
    stepTimeInput.value = this.timeout;
    stepTimeInput.min = this.kMinTimeout;
    stepTimeInput.max = 60000;
    stepTimeInput.step = 100;
    stepTimeInput.style.cssText = `
      padding: 10px;
      border: none;
      border-radius: 4px;
      background: ${colors.inputBg};
      color: ${colors.primaryText};
      font-size: 16px;
      transition: box-shadow 0.2s;
    `;
    stepTimeInput.onfocus = () => stepTimeInput.style.boxShadow = `0 0 0 2px ${colors.primary}`;
    stepTimeInput.onblur = () => stepTimeInput.style.boxShadow = 'none';
    
    // Add input validation with visual feedback
    stepTimeInput.onchange = () => {
      const value = parseInt(stepTimeInput.value) || this.kMinTimeout;
      if (value < this.kMinTimeout) {
        stepTimeInput.value = this.kMinTimeout;
        stepTimeInput.style.borderLeft = `3px solid ${colors.danger}`;
        setTimeout(() => {
          stepTimeInput.style.borderLeft = 'none';
        }, 2000);
      } else {
        stepTimeInput.style.borderLeft = 'none';
      }
      this.timeout = Math.max(value, this.kMinTimeout);
    };

    // Create raw mode toggle with grid layout
    const rawModeSection = document.createElement('div');
    rawModeSection.style.cssText = `
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px;
      align-items: center;
      padding: 12px;
      border-radius: 4px;
      background: ${colors.sectionBg};
    `;

    const rawModeCheckbox = document.createElement('input');
    rawModeCheckbox.type = 'checkbox';
    rawModeCheckbox.id = 'raw-mode-toggle';
    rawModeCheckbox.checked = this.rawMode;
    rawModeCheckbox.style.cssText = `
      width: 16px;
      height: 16px;
      accent-color: ${colors.primary};
    `;
    rawModeCheckbox.onchange = () => {
      this.rawMode = rawModeCheckbox.checked;
      console.log('Raw mode:', this.rawMode ? 'enabled' : 'disabled');
      
      // Update validation for existing emoji inputs
      const allEmojiInputs = framesContainer.querySelectorAll('input:nth-child(2)');
      allEmojiInputs.forEach(input => {
        if (this.rawMode) {
          input.style.borderLeft = 'none';
          input.title = '';
        } else {
          input.oninput(); // Trigger validation
        }
      });
    };

    const rawModeLabel = document.createElement('label');
    rawModeLabel.htmlFor = 'raw-mode-toggle';
    rawModeLabel.textContent = 'Raw Mode (disable all emoji_name validation)';
    rawModeLabel.style.cssText = `
      font-size: 12px;
      color: ${colors.primaryText};
      cursor: pointer;
      user-select: none;
    `;

    rawModeSection.appendChild(rawModeCheckbox);
    rawModeSection.appendChild(rawModeLabel);

    stepTimeSection.appendChild(stepTimeLabel);
    stepTimeSection.appendChild(stepTimeHelp);
    stepTimeSection.appendChild(stepTimeInput);
    stepTimeSection.appendChild(rawModeSection);

    // Create animation section
    const animationSection = document.createElement('div');
    animationSection.style.cssText = `
      display: grid;
      gap: 12px;
    `;

    const animationLabel = document.createElement('label');
    animationLabel.textContent = 'ANIMATION';
    animationLabel.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: ${colors.secondaryText};
      text-transform: uppercase;
    `;

    const framesContainer = document.createElement('div');
    framesContainer.id = 'frames-container';
    framesContainer.style.cssText = `
      display: grid;
      gap: 10px;
    `;

    animationSection.appendChild(animationLabel);
    animationSection.appendChild(framesContainer);

    // Create control buttons with grid layout
    const controlsSection = document.createElement('div');
    controlsSection.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    `;

    const addBtn = document.createElement('button');
    addBtn.innerHTML = '+ Add Frame';
    addBtn.style.cssText = `
      padding: 12px;
      border-radius: 4px;
      border: 2px solid ${colors.success};
      background: transparent;
      color: ${colors.success};
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    addBtn.onmouseover = () => {
      addBtn.style.background = colors.success;
      addBtn.style.color = 'white';
    };
    addBtn.onmouseout = () => {
      addBtn.style.background = 'transparent';
      addBtn.style.color = colors.success;
    };
    addBtn.onclick = () => this.addFrame(framesContainer, colors);

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '- Remove Frame';
    removeBtn.style.cssText = `
      padding: 12px;
      border-radius: 4px;
      border: 2px solid ${colors.danger};
      background: transparent;
      color: ${colors.danger};
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    removeBtn.onmouseover = () => {
      removeBtn.style.background = colors.danger;
      removeBtn.style.color = 'white';
    };
    removeBtn.onmouseout = () => {
      removeBtn.style.background = 'transparent';
      removeBtn.style.color = colors.danger;
    };
    removeBtn.onclick = () => this.removeFrame(framesContainer);

    controlsSection.appendChild(addBtn);
    controlsSection.appendChild(removeBtn);

    // Create action buttons with grid layout
    const actionsSection = document.createElement('div');
    actionsSection.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    `;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.cssText = `
      padding: 12px 16px;
      border: none;
      border-radius: 4px;
      background: ${colors.success};
      color: white;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.2s;
    `;
    saveBtn.onmouseover = () => saveBtn.style.opacity = '0.9';
    saveBtn.onmouseout = () => saveBtn.style.opacity = '1';
    saveBtn.onclick = () => this.saveAnimation(framesContainer, saveBtn);

    const startStopBtn = document.createElement('button');
    startStopBtn.textContent = this.isRunning ? 'Stop' : 'Start';
    startStopBtn.style.cssText = `
      padding: 12px 16px;
      border: none;
      border-radius: 4px;
      background: ${this.isRunning ? colors.danger : colors.primary};
      color: white;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.2s;
    `;
    startStopBtn.onmouseover = () => startStopBtn.style.opacity = '0.9';
    startStopBtn.onmouseout = () => startStopBtn.style.opacity = '1';
    startStopBtn.onclick = () => this.toggleAnimation(startStopBtn, colors);

    const doneBtn = document.createElement('button');
    doneBtn.textContent = 'Done';
    doneBtn.style.cssText = `
      padding: 12px 16px;
      border: none;
      border-radius: 4px;
      background: ${colors.primary};
      color: white;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.2s;
    `;
    doneBtn.onmouseover = () => doneBtn.style.opacity = '0.9';
    doneBtn.onmouseout = () => doneBtn.style.opacity = '1';
    doneBtn.onclick = () => overlay.remove();

    actionsSection.appendChild(saveBtn);
    actionsSection.appendChild(startStopBtn);
    actionsSection.appendChild(doneBtn);

    // Assemble modal using grid layout
    modal.appendChild(header);
    modal.appendChild(stepTimeSection);
    modal.appendChild(animationSection);
    modal.appendChild(controlsSection);
    modal.appendChild(actionsSection);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add initial frames and load saved data
    this.addFrame(framesContainer, colors);
    this.addFrame(framesContainer, colors);
    this.loadSavedAnimation(framesContainer);

    // Store references
    this.startStopBtn = startStopBtn;
    this.colors = colors;
  }

  addFrame(container, colors) {
    const frameDiv = document.createElement('div');
    frameDiv.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      padding: 12px;
      border-radius: 4px;
      background: ${colors.sectionBg};
    `;

    // Text input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Status text';
    textInput.style.cssText = `
      padding: 10px;
      border: none;
      border-radius: 4px;
      background: ${colors.inputBg};
      color: ${colors.primaryText};
      font-size: 14px;
      transition: box-shadow 0.2s;
    `;
    textInput.onfocus = () => textInput.style.boxShadow = `0 0 0 2px ${colors.primary}`;
    textInput.onblur = () => textInput.style.boxShadow = 'none';

    // Emoji name input with validation
    const emojiInput = document.createElement('input');
    emojiInput.type = 'text';
    emojiInput.placeholder = '🔥 / nitro_name';
    emojiInput.style.cssText = `
      padding: 10px;
      border: none;
      border-radius: 4px;
      background: ${colors.inputBg};
      color: ${colors.primaryText};
      font-size: 14px;
      transition: box-shadow 0.2s;
    `;
    emojiInput.onfocus = () => emojiInput.style.boxShadow = `0 0 0 2px ${colors.primary}`;
    emojiInput.onblur = () => emojiInput.style.boxShadow = 'none';

    // Add whitespace validation for emoji_name
    emojiInput.oninput = () => {
      if (!this.rawMode && emojiInput.value.includes(' ')) {
        emojiInput.style.borderLeft = `3px solid ${colors.danger}`;
        emojiInput.title = 'Emoji names cannot contain whitespace or Discord will ignore the status';
      } else {
        emojiInput.style.borderLeft = 'none';
        emojiInput.title = '';
      }
    };

    // Also validate on blur (when user clicks away)
    emojiInput.onblur = () => {
      emojiInput.style.boxShadow = 'none';
      if (!this.rawMode && emojiInput.value.includes(' ')) {
        const confirmed = confirm('Emoji name contains whitespace which will cause Discord to ignore your status. Remove whitespace automatically?');
        if (confirmed) {
          emojiInput.value = emojiInput.value.replace(/\s+/g, '');
          emojiInput.style.borderLeft = 'none';
          emojiInput.title = '';
        }
      }
    };

    // Emoji ID input
    const emojiIdInput = document.createElement('input');
    emojiIdInput.type = 'text';
    emojiIdInput.placeholder = 'nitro_id';
    emojiIdInput.style.cssText = `
      padding: 10px;
      border: none;
      border-radius: 4px;
      background: ${colors.inputBg};
      color: ${colors.primaryText};
      font-size: 14px;
      transition: box-shadow 0.2s;
    `;
    emojiIdInput.onfocus = () => emojiIdInput.style.boxShadow = `0 0 0 2px ${colors.primary}`;
    emojiIdInput.onblur = () => emojiIdInput.style.boxShadow = 'none';

    frameDiv.appendChild(textInput);
    frameDiv.appendChild(emojiInput);
    frameDiv.appendChild(emojiIdInput);
    container.appendChild(frameDiv);
  }

  removeFrame(container) {
    const frames = container.children;
    if (frames.length > 1) {
      container.removeChild(frames[frames.length - 1]);
    }
  }

  saveAnimation(container, saveBtn) {
    const frames = [];
    const frameElements = container.children;

    for (let i = 0; i < frameElements.length; i++) {
      const inputs = frameElements[i].querySelectorAll('input');
      const emojiName = inputs[1].value || '';
      
      // Only validate emoji_name for whitespace if not in raw mode
      if (!this.rawMode && emojiName.includes(' ')) {
        alert(`Frame ${i + 1}: Emoji name "${emojiName}" contains whitespace and will be ignored by Discord. Please remove spaces or enable Raw Mode.`);
        inputs[1].focus();
        inputs[1].style.borderLeft = `3px solid ${this.colors.danger}`;
        return;
      }
      
      const frame = {
        text: inputs[0].value || '',
        emoji_name: emojiName,
        emoji_id: inputs[2].value || '',
        timeout: this.timeout
      };
      frames.push(frame);
    }

    this.animation = frames;
    
    // Save to memory for persistence across GUI reopens
    this.savedAnimationData = {
      frames: frames,
      timeout: this.timeout,
      rawMode: this.rawMode
    };
    
    console.log('Animation saved:', frames);
    
    // Show feedback
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.style.background = this.colors.success;
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = this.colors.success;
    }, 1000);
  }

  loadSavedAnimation(container) {
    if (!this.savedAnimationData || !this.savedAnimationData.frames) {
      return; // No saved data
    }

    const { frames, timeout, rawMode } = this.savedAnimationData;
    
    // Restore settings
    this.timeout = timeout;
    this.rawMode = rawMode;
    this.animation = frames;

    // Clear existing frames
    while (container.children.length > 0) {
      container.removeChild(container.firstChild);
    }

    // Add frames with saved data
    frames.forEach(frame => {
      this.addFrame(container, this.colors);
      const lastFrame = container.lastChild;
      const inputs = lastFrame.querySelectorAll('input');
      
      inputs[0].value = frame.text || '';
      inputs[1].value = frame.emoji_name || '';
      inputs[2].value = frame.emoji_id || '';
    });

    // Update UI elements to reflect loaded settings
    const stepTimeInput = document.querySelector('#animated-status-gui input[type="number"]');
    if (stepTimeInput) {
      stepTimeInput.value = timeout;
    }

    const rawModeCheckbox = document.getElementById('raw-mode-toggle');
    if (rawModeCheckbox) {
      rawModeCheckbox.checked = rawMode;
    }

    console.log('Loaded saved animation:', frames);
  }

  toggleAnimation(button, colors) {
    if (this.isRunning) {
      this.stop();
      button.textContent = 'Start';
      button.style.background = colors.primary;
      this.isRunning = false;
    } else {
      this.start();
      button.textContent = 'Stop';
      button.style.background = colors.danger;
      this.isRunning = true;
    }
  }

  async resolveStatusField(text = "") {
    const evalPrefix = "eval ";
    if (!text.startsWith(evalPrefix)) return text;

    try {
      const result = eval(text.substring(evalPrefix.length));
      return result;
    } catch (e) {
      console.error("Eval error:", e);
      console.error("Failed to eval:", text);
      return "";
    }
  }

  configObjectFromArray(arr) {
    const data = {};
    if (arr[0] !== undefined && arr[0] !== null && arr[0].toString().length > 0) data.text = arr[0].toString();
    if (arr[1] !== undefined && arr[1] !== null && arr[1].toString().length > 0) data.emoji_name = arr[1].toString();
    if (arr[2] !== undefined && arr[2] !== null && arr[2].toString().length > 0) data.emoji_id = arr[2].toString();
    return data;
  }

  async setStatus(status) {
    if (!this.authToken) {
      console.error("No auth token available");
      return;
    }

    try {
      const response = await fetch("/api/v9/users/@me/settings", {
        method: "PATCH",
        headers: {
          "authorization": this.authToken,
          "content-type": "application/json"
        },
        body: JSON.stringify({ custom_status: status === {} ? null : status })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Status update failed (${response.status}):`, errorText);
      } else {
        console.log("Status updated:", status);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  animationLoop(i = 0) {
    if (this.animation.length === 0) {
      console.log("No animation frames set");
      return;
    }

    i %= this.animation.length;

    let shouldContinue = true;
    this.loop = undefined;
    this.cancel = () => { shouldContinue = false; };

    const frame = this.animation[i];
    
    Promise.all([
      this.resolveStatusField(frame.text || ""),
      this.resolveStatusField(frame.emoji_name || ""),
      this.resolveStatusField(frame.emoji_id || "")
    ]).then(resolved => {
      console.log("Resolved frame values:", resolved);
      const statusObj = this.configObjectFromArray(resolved);
      console.log("Status object:", statusObj);
      this.setStatus(statusObj);
      this.cancel = undefined;

      if (shouldContinue) {
        const frameTimeout = frame.timeout || this.timeout;
        this.loop = setTimeout(() => {
          if (this.randomize) {
            i += Math.floor(Math.random() * (this.animation.length - 1));
          }
          this.animationLoop(i + 1);
        }, frameTimeout);
      }
    });
  }

  start() {
    if (this.animation.length === 0) {
      console.log("No animation set. Use Save button first.");
      return;
    }
    
    console.log("Starting animated status...");
    this.animationLoop();
  }

  stop() {
    if (this.cancel) {
      this.cancel();
    } else if (this.loop !== undefined) {
      clearTimeout(this.loop);
    }
    
    this.setStatus(null);
    console.log("Animated status stopped");
  }

  show() {
    this.createGUI();
  }
}

// Create global instance
window.animatedStatusGUI = new WebAnimatedStatusGUI();

// Helper function to show GUI
window.showAnimatedStatusGUI = () => {
  window.animatedStatusGUI.show();
};

console.log(`
🎬 Discord Web Animated Status GUI Loaded!

Usage:
Run: showAnimatedStatusGUI()

⚠️  WARNING: This modifies Discord's behavior and may violate their Terms of Service.
   Use at your own risk!
`);
