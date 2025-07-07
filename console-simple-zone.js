/**
 * 🔍 CONSOLE ZONE DIAGNOSTIC - COPY-PASTE FRIENDLY
 * Minimal version for clean results analysis
 */

// Simple zone tracker - no spam, clean output
window.zoneTracker = {
    results: [],
    tracking: false,
    
    start() {
        this.results = [];
        this.tracking = true;
        
        console.log('🔍 Zone tracking started - make pinch gesture in Zone 2');
        console.log('📝 Will capture up to 10 zone events (throttled)');
        
        // Set up throttled event capture
        this.setupCapture();
    },
    
    stop() {
        this.tracking = false;
        console.log('🔍 Zone tracking stopped');
        this.showResults();
    },
    
    setupCapture() {
        if (!window.gcFreeOrchestrator) {
            console.error('❌ gcFreeOrchestrator not found');
            return;
        }
        
        let lastCapture = 0;
        const originalEmit = window.gcFreeOrchestrator.emit;
        
        window.gcFreeOrchestrator.emit = (eventType, data) => {
            if (this.tracking && this.shouldCapture(eventType, data)) {
                const now = Date.now();
                if (now - lastCapture > 200) { // 200ms throttle
                    this.captureEvent(eventType, data);
                    lastCapture = now;
                }
            }
            return originalEmit.call(window.gcFreeOrchestrator, eventType, data);
        };
    },
    
    shouldCapture(eventType, data) {
        if (this.results.length >= 10) return false; // Limit to 10 events
        
        const zoneEvents = ['pinchState', 'audio', 'midi'];
        if (!zoneEvents.includes(eventType)) return false;
        
        // Must have zone info
        return data && (data.zone !== undefined || data.spatialZone !== undefined || 
                       data.zoneName !== undefined || data.hand !== undefined);
    },
    
    captureEvent(eventType, data) {
        const zones = {};
        if (data.zone !== undefined) zones.zone = data.zone;
        if (data.spatialZone !== undefined) zones.spatialZone = data.spatialZone;
        if (data.zoneName !== undefined) zones.zoneName = data.zoneName;
        if (data.hand !== undefined) zones.hand = data.hand === 0 ? 1 : 2;
        
        this.results.push({
            event: eventType,
            zones: zones,
            finger: data.finger,
            action: data.action || data.eventType
        });
        
        console.log(`📊 Event ${this.results.length}: ${eventType} →`, zones);
    },
    
    showResults() {
        console.log('\n🔍 ZONE DIAGNOSTIC RESULTS');
        console.log('═══════════════════════════');
        
        if (this.results.length === 0) {
            console.log('❌ No zone events captured');
            return;
        }
        
        // Analysis
        const zone1Events = this.results.filter(r => 
            Object.values(r.zones).includes(1) || 
            Object.values(r.zones).includes('Zone 1 (Left)')
        ).length;
        
        const zone2Events = this.results.filter(r => 
            Object.values(r.zones).includes(2) || 
            Object.values(r.zones).includes('Zone 2 (Right)')
        ).length;
        
        const contamination = zone1Events > 0 && zone2Events > 0;
        
        console.log(`📊 Total Events: ${this.results.length}`);
        console.log(`📊 Zone 1 Events: ${zone1Events}`);
        console.log(`📊 Zone 2 Events: ${zone2Events}`);
        console.log(`📊 Cross-Contamination: ${contamination ? '❌ DETECTED' : '✅ None'}`);
        
        console.log('\n📋 EVENT DETAILS:');
        this.results.forEach((result, i) => {
            const zoneStr = Object.entries(result.zones)
                .map(([key, value]) => `${key}:${value}`)
                .join(' ');
            console.log(`${i + 1}. ${result.event} → ${zoneStr}`);
        });
        
        console.log('\n📝 COPY-PASTE RESULTS:');
        console.log(this.getCopyText());
    },
    
    getCopyText() {
        const zone1Events = this.results.filter(r => 
            Object.values(r.zones).includes(1) || 
            Object.values(r.zones).includes('Zone 1 (Left)')
        ).length;
        
        const zone2Events = this.results.filter(r => 
            Object.values(r.zones).includes(2) || 
            Object.values(r.zones).includes('Zone 2 (Right)')
        ).length;
        
        const contamination = zone1Events > 0 && zone2Events > 0;
        
        let text = `🔍 ZONE DIAGNOSTIC RESULTS\n`;
        text += `Total Events: ${this.results.length}\n`;
        text += `Zone 1 Events: ${zone1Events}\n`;
        text += `Zone 2 Events: ${zone2Events}\n`;
        text += `Cross-Contamination: ${contamination ? 'DETECTED' : 'None'}\n\n`;
        
        text += `EVENT LOG:\n`;
        this.results.forEach((result, i) => {
            const zoneStr = Object.entries(result.zones)
                .map(([key, value]) => `${key}:${value}`)
                .join(' ');
            text += `${i + 1}. ${result.event} → ${zoneStr}\n`;
        });
        
        return text;
    },
    
    copy() {
        const text = this.getCopyText();
        navigator.clipboard.writeText(text).then(() => {
            console.log('📋 Results copied to clipboard!');
        }).catch(err => {
            console.log('❌ Copy failed, manually copy the text above');
        });
    }
};

// Instructions
console.log('🔍 SIMPLE ZONE DIAGNOSTIC LOADED');
console.log('');
console.log('📋 INSTRUCTIONS:');
console.log('1. zoneTracker.start() - Begin tracking');
console.log('2. Make pinch gesture in Zone 2 (right side)');
console.log('3. zoneTracker.stop() - End tracking & show results');
console.log('4. zoneTracker.copy() - Copy results to clipboard');
console.log('');
console.log('🚀 Ready to start: zoneTracker.start()');

// Auto-start if requested
if (window.location.search.includes('auto-zone=true')) {
    setTimeout(() => {
        console.log('🚀 Auto-starting zone tracker...');
        window.zoneTracker.start();
    }, 1000);
} 