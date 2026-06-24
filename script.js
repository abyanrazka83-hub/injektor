/**
 * ========================================
 * QUANTUMCORE - MAIN APPLICATION
 * Version 2.6
 * Developer: YANZ
 * ========================================
 */

(function() {

    'use strict';

    // ========================================
    // DOM REFERENCES
    // ========================================

    const terminal = document.getElementById('terminal');
    const statusText = document.getElementById('statusText');
    const toast = document.getElementById('toast');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const injectBtn = document.getElementById('injectBtn');
    const pairingInput = document.getElementById('pairingInput');
    const featureCount = document.getElementById('featureCount');

    const btnFF = document.getElementById('btnFF');
    const btnFFMAX = document.getElementById('btnFFMAX');

    const autoFF = document.getElementById('autoFF');
    const autoFFMAX = document.getElementById('autoFFMAX');
    const autoNone = document.getElementById('autoNone');

    const featureToggles = document.querySelectorAll('.feature-toggle');

    // ========================================
    // STATE
    // ========================================

    let selectedGame = 'FFMAX';
    let selectedAuto = 'FFMAX';
    let logCount = 0;
    let isInjecting = false;

    const featureState = {
        fps: {
            active: true,
            dot: document.getElementById('dotFps'),
            status: document.getElementById('statusFps')
        },
        drag: {
            active: true,
            dot: document.getElementById('dotDrag'),
            status: document.getElementById('statusDrag')
        },
        smooth: {
            active: true,
            dot: document.getElementById('dotSmooth'),
            status: document.getElementById('statusSmooth')
        },
        responsive: {
            active: true,
            dot: document.getElementById('dotResponsive'),
            status: document.getElementById('statusResponsive')
        },
        bypass: {
            active: true,
            dot: document.getElementById('dotBypass'),
            status: document.getElementById('statusBypass')
        },
        fullscreen: {
            active: true,
            dot: document.getElementById('dotFullscreen'),
            status: document.getElementById('statusFullscreen')
        }
    };

    const featureNames = {
        fps: 'Boost FPS',
        drag: 'Easy Drag 14%',
        smooth: 'Smooth Graphics',
        responsive: 'Responsif Layar',
        bypass: 'Bypass Security',
        fullscreen: 'Full Layar'
    };

    // ========================================
    // TOAST NOTIFICATION
    // ========================================

    function showToast(msg, type) {
        toast.textContent = msg;
        toast.className = 'toast';
        if (type) toast.classList.add(type);
        toast.classList.add('show');

        clearTimeout(toast._timer);
        toast._timer = setTimeout(function() {
            toast.classList.remove('show');
        }, 2800);
    }

    // ========================================
    // TERMINAL LOG
    // ========================================

    function addLog(msg, type) {
        type = type || 'info';

        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                        now.getMinutes().toString().padStart(2, '0') + ':' +
                        now.getSeconds().toString().padStart(2, '0');

        const div = document.createElement('div');
        div.className = 'log-line';

        let cls = 'log-msg';
        if (type === 'success') cls += ' success';
        else if (type === 'error') cls += ' error';
        else if (type === 'warn') cls += ' warn';
        else if (type === 'cyan') cls += ' cyan';
        else if (type === 'purple') cls += ' purple';
        else if (type === 'highlight') cls += ' highlight';

        div.innerHTML = '<span class="log-time">[' + timeStr + ']</span><span class="' + cls + '">' + msg + '</span>';

        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
        logCount++;

        if (logCount > 80) {
            terminal.removeChild(terminal.firstChild);
            logCount--;
        }
    }

    // ========================================
    // FEATURE TOGGLES
    // ========================================

    function updateFeatureUI(key) {
        var feat = featureState[key];
        if (!feat) return;

        var isOn = feat.active;
        feat.dot.className = 'dot ' + (isOn ? 'on' : 'off');
        feat.status.textContent = isOn ? 'ON' : 'OFF';
        feat.status.className = 'status-badge ' + (isOn ? 'on' : 'off');

        updateFeatureCount();
    }

    function toggleFeature(key) {
        var feat = featureState[key];
        if (!feat) return;

        feat.active = !feat.active;
        updateFeatureUI(key);

        addLog(featureNames[key] + ' → ' + (feat.active ? 'ON' : 'OFF'), feat.active ? 'success' : 'warn');
    }

    function updateFeatureCount() {
        var active = 0;
        var total = 0;

        for (var key in featureState) {
            total++;
            if (featureState[key].active) active++;
        }

        featureCount.textContent = active + '/' + total + ' active';
    }

    // ========================================
    // GAME SELECTOR
    // ========================================

    function setGameSelection(game) {
        selectedGame = game;

        if (game === 'FFMAX') {
            btnFFMAX.className = 'active-ffmax';
            btnFF.className = '';
            addLog('Target: FREE FIRE MAX', 'cyan');
        } else {
            btnFF.className = 'active-ff';
            btnFFMAX.className = '';
            addLog('Target: FREE FIRE', 'warn');
        }

        statusText.textContent = game === 'FFMAX' ? 'FF MAX' : 'FREE FIRE';
    }

    // ========================================
    // AUTO OPEN
    // ========================================

    function setAutoSelection(opt) {
        selectedAuto = opt;

        autoFFMAX.className = '';
        autoFF.className = '';
        autoNone.className = '';

        if (opt === 'FFMAX') {
            autoFFMAX.className = 'active-auto';
            addLog('Auto open: FF MAX', 'cyan');
        } else if (opt === 'FF') {
            autoFF.className = 'active-auto-ff';
            addLog('Auto open: FREE FIRE', 'warn');
        } else {
            autoNone.className = 'active-auto';
            addLog('Auto open: DISABLED', 'info');
        }
    }

    // ========================================
    // LAUNCH GAME (Android Intent)
    // ========================================

    function launchGame(packageName, gameName) {
        try {
            var intentUrl = 'intent://' + packageName + '/#Intent;package=' + packageName + ';end';

            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = intentUrl;
            document.body.appendChild(iframe);

            setTimeout(function() {
                document.body.removeChild(iframe);
            }, 3000);

            setTimeout(function() {
                try {
                    window.location.href = intentUrl;
                } catch(e) {}
            }, 100);

            addLog('Launching ' + gameName + '...', 'success');
            showToast('Opening ' + gameName + '...', 'success');

            return true;
        } catch(e) {
            addLog('Failed to launch ' + gameName + ': ' + e.message, 'error');
            showToast('Cannot open ' + gameName, 'error');
            return false;
        }
    }

    // ========================================
    // RIPPLE EFFECT
    // ========================================

    function createRipple(e, btn) {
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'ripple';

        var size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

        btn.appendChild(ripple);

        setTimeout(function() {
            ripple.remove();
        }, 600);
    }

    // ========================================
    // INJECTION PROCESS
    // ========================================

    function doInject(e) {
        if (isInjecting) return;

        createRipple(e, injectBtn);

        var pairCode = pairingInput.value.trim();
        var activeFeatures = [];
        var inactiveFeatures = [];

        for (var key in featureState) {
            if (featureState[key].active) {
                activeFeatures.push(featureNames[key]);
            } else {
                inactiveFeatures.push(featureNames[key]);
            }
        }

        if (activeFeatures.length === 0) {
            addLog('ERROR: No features selected!', 'error');
            showToast('Select at least one feature!', 'error');
            return;
        }

        isInjecting = true;
        injectBtn.style.opacity = '0.7';
        injectBtn.querySelector('.btn-text').innerHTML = '<span class="arrow">⏳</span> PROCESSING...';

        addLog('═══════════════════════════════════', 'purple');
        addLog('INJECTION INITIATED', 'highlight');
        addLog('Target: ' + selectedGame, 'cyan');
        addLog('Pairing: ' + (pairCode || 'none'), 'info');

        // Show feature status
        for (var k in featureState) {
            var name = featureNames[k];
            var state = featureState[k].active;
            var statusClass = state ? 'status-on' : 'status-off';
            var statusText2 = state ? 'ON' : 'OFF';
            addLog(name + ' : <span class="' + statusClass + '">' + statusText2 + '</span>', 'info');
        }

        var steps = [];
        if (featureState.fps.active) steps.push('Boost FPS enabled');
        if (featureState.drag.active) steps.push('Easy Drag 14% applied');
        if (featureState.smooth.active) steps.push('Smooth Graphics active');
        if (featureState.responsive.active) steps.push('Responsif Layar active');
        if (featureState.bypass.active) steps.push('Bypass Security active');
        if (featureState.fullscreen.active) steps.push('Full Layar active');

        var idx = 0;

        var interval = setInterval(function() {
            if (idx < steps.length) {
                addLog('✓ ' + steps[idx], 'success');
                idx++;
            } else {
                clearInterval(interval);

                var gameName = selectedGame === 'FFMAX' ? 'FF MAX' : 'FREE FIRE';
                var pairMsg = pairCode ? ' | Pair: ' + pairCode : '';

                addLog('═══════════════════════════════════', 'purple');
                addLog('INJECTION COMPLETE', 'success');
                addLog('Game: ' + gameName + ' | Features: ' + activeFeatures.length + ' active' + pairMsg, 'highlight');

                statusText.textContent = 'ACTIVE ✓';
                showToast('Injection successful! ' + gameName, 'success');

                injectBtn.querySelector('.btn-text').innerHTML = '<span class="arrow">✓</span> INJECTED';

                // Auto open
                if (selectedAuto !== 'None') {
                    var autoGame = selectedAuto === 'FFMAX' ? 'FF MAX' : 'FREE FIRE';
                    var packageName = selectedAuto === 'FFMAX' ? 'com.dts.freefiremax' : 'com.dts.freefire';

                    setTimeout(function() {
                        addLog('Auto open: ' + autoGame, 'cyan');
                        launchGame(packageName, autoGame);
                    }, 800);
                }

                setTimeout(function() {
                    isInjecting = false;
                    injectBtn.style.opacity = '1';
                    injectBtn.querySelector('.btn-text').innerHTML = '<span class="arrow">▶</span> INJECT NOW';
                }, 3000);
            }
        }, 300);
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    function init() {
        // Hide loading overlay
        setTimeout(function() {
            loadingOverlay.classList.add('hidden');
            addLog('System initialized', 'success');
            addLog('Ready for injection', 'cyan');
            statusText.textContent = 'READY';
        }, 1200);

        // Setup event listeners
        setupListeners();

        // Game detection simulation
        addLog('Game detection: FF ✓ | FF MAX ✓', 'success');

        // Update feature count
        updateFeatureCount();
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    function setupListeners() {
        // Game selector
        btnFFMAX.addEventListener('click', function() {
            setGameSelection('FFMAX');
        });

        btnFF.addEventListener('click', function() {
            setGameSelection('FF');
        });

        // Auto open
        autoFFMAX.addEventListener('click', function() {
            setAutoSelection('FFMAX');
        });

        autoFF.addEventListener('click', function() {
            setAutoSelection('FF');
        });

        autoNone.addEventListener('click', function() {
            setAutoSelection('None');
        });

        // Feature toggles
        for (var i = 0; i < featureToggles.length; i++) {
            (function(el) {
                el.addEventListener('click', function() {
                    var key = this.dataset.feature;
                    if (key) toggleFeature(key);
                });
            })(featureToggles[i]);
        }

        // Inject button
        injectBtn.addEventListener('click', doInject);

        // Toast click dismiss
        toast.addEventListener('click', function() {
            toast.classList.remove('show');
        });
    }

    // ========================================
    // START APPLICATION
    // ========================================

    document.addEventListener('DOMContentLoaded', init);

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        // Nothing to cleanup
    });

})();