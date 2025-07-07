/**
 * 🔍 QUICK CONSOLE ZONE DIAGNOSTIC
 * Copy-paste this into your browser console while on the main app page
 * 
 * Usage:
 * 1. Open index-modular-monolith.html in your browser
 * 2. Open Developer Tools (F12)
 * 3. Paste this entire script into the console
 * 4. Run the diagnostic commands
 */

// Load diagnostic system dynamically
function loadZoneDiagnostic() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './zone-pinch-diagnostic.js';
        script.onload = () => {
            console.log('🔍 Zone Diagnostic System Loaded Successfully!');
            resolve();
        };
        script.onerror = (error) => {
            console.error('❌ Failed to load zone diagnostic system:', error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Quick diagnostic commands
window.quickZoneDiagnostic = {
    async init() {
        try {
            await loadZoneDiagnostic();
            console.log('🎯 Zone Diagnostic Commands Available:');
            console.log('   quickZoneDiagnostic.start() - Start tracing');
            console.log('   quickZoneDiagnostic.stop() - Stop tracing');
            console.log('   quickZoneDiagnostic.show() - Show diagnostic panel');
            console.log('   quickZoneDiagnostic.autoTrace() - Auto-trace for 10 seconds');
            console.log('');
            console.log('📋 INSTRUCTIONS:');
            console.log('1. Run: quickZoneDiagnostic.start()');
            console.log('2. Make a pinch gesture in Zone 2 (right side)');
            console.log('3. Run: quickZoneDiagnostic.stop()');
            console.log('4. Check the diagnostic panel for results');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize zone diagnostic:', error);
            return false;
        }
    },
    
    start() {
        if (window.startZoneTrace) {
            window.startZoneTrace();
            console.log('🟢 Zone tracing started - make a pinch gesture in Zone 2');
        } else {
            console.error('❌ Diagnostic system not loaded. Run quickZoneDiagnostic.init() first');
        }
    },
    
    stop() {
        if (window.stopZoneTrace) {
            window.stopZoneTrace();
            console.log('🔴 Zone tracing stopped - check results');
        } else {
            console.error('❌ Diagnostic system not loaded. Run quickZoneDiagnostic.init() first');
        }
    },
    
    show() {
        if (window.showZoneDiagnostic) {
            window.showZoneDiagnostic();
            console.log('👁️ Diagnostic panel shown');
        } else {
            console.error('❌ Diagnostic system not loaded. Run quickZoneDiagnostic.init() first');
        }
    },
    
    autoTrace() {
        console.log('🚀 Auto-trace started for 10 seconds');
        console.log('🎯 Make pinch gestures in Zone 2 NOW!');
        
        this.start();
        
        setTimeout(() => {
            this.stop();
            console.log('⏰ Auto-trace completed - check results');
        }, 10000);
    },
    
    help() {
        console.log('🔍 Zone Diagnostic Commands:');
        console.log('   init() - Initialize diagnostic system');
        console.log('   start() - Start tracing');
        console.log('   stop() - Stop tracing');
        console.log('   show() - Show diagnostic panel');
        console.log('   autoTrace() - Auto-trace for 10 seconds');
        console.log('   help() - Show this help');
    }
};

// Auto-initialize if on the main app page
if (document.title.includes('TAGS-MVP') || window.location.pathname.includes('index-modular-monolith')) {
    console.log('🔍 Zone Diagnostic System Ready!');
    console.log('🚀 Run: quickZoneDiagnostic.init()');
    console.log('📖 Or run: quickZoneDiagnostic.help()');
} else {
    console.log('⚠️ This script should be run on the main app page (index-modular-monolith.html)');
}

// Export for copy-paste convenience
console.log(`
🔍 QUICK ZONE DIAGNOSTIC COMMANDS:
═══════════════════════════════════
quickZoneDiagnostic.init()      - Initialize system
quickZoneDiagnostic.start()     - Start tracing
quickZoneDiagnostic.stop()      - Stop tracing
quickZoneDiagnostic.show()      - Show diagnostic panel
quickZoneDiagnostic.autoTrace() - Auto-trace for 10 seconds
quickZoneDiagnostic.help()      - Show help

💡 COPY-PASTE THIS ENTIRE SCRIPT INTO YOUR BROWSER CONSOLE
`); 