// 🔍 COMPREHENSIVE ZONE AUDIT - DEEP DIAGNOSTIC
window.zoneAudit = {
    results: [],
    tracking: false,
    
    start() {
        this.results = [];
        this.tracking = true;
        console.log('🔍 COMPREHENSIVE ZONE AUDIT STARTED');
        console.log('This will trace the exact flow of zone data through all systems');
        
        // 1. INTERCEPT getSimpleModeNote function
        if (typeof getSimpleModeNote === 'function') {
            const originalGetSimpleModeNote = getSimpleModeNote;
            window.getSimpleModeNote = function(hand, finger) {
                console.log('🔍 SIMPLE NOTE FUNCTION CALLED:', {
                    hand: hand,
                    finger: finger,
                    timestamp: Date.now()
                });
                
                // Check if window.lastHandData exists
                console.log('🔍 HAND DATA AVAILABILITY:', {
                    lastHandDataExists: !!window.lastHandData,
                    handDataForHand: window.lastHandData ? !!window.lastHandData[hand] : false,
                    fingerDataForFinger: window.lastHandData && window.lastHandData[hand] ? !!window.lastHandData[hand][finger] : false
                });
                
                if (window.lastHandData && window.lastHandData[hand] && window.lastHandData[hand][finger]) {
                    const fingerTip = window.lastHandData[hand][finger];
                    console.log('🔍 FINGER TIP DATA:', {
                        fingerTip: fingerTip,
                        hasX: fingerTip.x !== undefined,
                        xValue: fingerTip.x,
                        flippedX: fingerTip.x !== undefined ? (1.0 - fingerTip.x) : 'N/A'
                    });
                }
                
                const result = originalGetSimpleModeNote.call(this, hand, finger);
                console.log('🔍 SIMPLE NOTE RESULT:', {
                    inputHand: hand,
                    inputFinger: finger,
                    outputNote: result,
                    noteName: window.MIDINoteMapping ? window.MIDINoteMapping.getNoteName(result) : 'N/A'
                });
                
                return result;
            };
        } else {
            console.log('❌ getSimpleModeNote function not found');
        }
        
        // 2. INTERCEPT sendMIDINoteOn function
        if (typeof sendMIDINoteOn === 'function') {
            const originalSendMIDINoteOn = sendMIDINoteOn;
            window.sendMIDINoteOn = function(hand, finger) {
                console.log('🔍 SEND MIDI NOTE ON CALLED:', {
                    hand: hand,
                    finger: finger,
                    timestamp: Date.now()
                });
                
                const result = originalSendMIDINoteOn.call(this, hand, finger);
                console.log('🔍 SEND MIDI NOTE ON COMPLETED');
                
                return result;
            };
        } else {
            console.log('❌ sendMIDINoteOn function not found');
        }
        
        // 3. INTERCEPT gcFreeOrchestrator.emit
        if (window.gcFreeOrchestrator && window.gcFreeOrchestrator.emit) {
            const originalEmit = window.gcFreeOrchestrator.emit;
            window.gcFreeOrchestrator.emit = (eventType, data) => {
                if (this.tracking && this.shouldCapture(eventType, data)) {
                    this.captureEvent(eventType, data);
                }
                return originalEmit.call(window.gcFreeOrchestrator, eventType, data);
            };
        } else {
            console.log('❌ gcFreeOrchestrator not found');
        }
        
        console.log('🔍 AUDIT READY - Make a pinch gesture in Zone 2 (right side)');
    },
    
    shouldCapture(eventType, data) {
        if (this.results.length >= 20) return false;
        const relevantEvents = ['pinchState', 'audio', 'midi'];
        return relevantEvents.includes(eventType) && data;
    },
    
    captureEvent(eventType, data) {
        const zones = {};
        if (data.zone !== undefined) zones.zone = data.zone;
        if (data.spatialZone !== undefined) zones.spatialZone = data.spatialZone;
        if (data.zoneName !== undefined) zones.zoneName = data.zoneName;
        if (data.hand !== undefined) zones.hand = data.hand;
        if (data.finger !== undefined) zones.finger = data.finger;
        if (data.action !== undefined) zones.action = data.action;
        
        this.results.push({
            event: eventType,
            zones: zones,
            timestamp: Date.now()
        });
        
        console.log(`🔍 CAPTURED EVENT ${this.results.length}: ${eventType}`, zones);
    },
    
    stop() {
        this.tracking = false;
        console.log('🔍 COMPREHENSIVE ZONE AUDIT STOPPED');
        
        // Analyze results
        const pinchEvents = this.results.filter(r => r.event === 'pinchState');
        const audioEvents = this.results.filter(r => r.event === 'audio');
        const midiEvents = this.results.filter(r => r.event === 'midi');
        
        console.log(`📊 AUDIT RESULTS:`);
        console.log(`📊 Total Events: ${this.results.length}`);
        console.log(`📊 Pinch Events: ${pinchEvents.length}`);
        console.log(`📊 Audio Events: ${audioEvents.length}`);
        console.log(`📊 MIDI Events: ${midiEvents.length}`);
        
        // Check for zone consistency
        const zones = new Set();
        this.results.forEach(r => {
            if (r.zones.spatialZone) zones.add(`spatialZone:${r.zones.spatialZone}`);
            if (r.zones.zoneName) zones.add(`zoneName:${r.zones.zoneName}`);
        });
        
        console.log(`📊 Zone Consistency: ${zones.size <= 2 ? '✅ CONSISTENT' : '❌ INCONSISTENT'}`);
        console.log(`📊 Zones Detected:`, Array.from(zones));
        
        // Full event log
        console.log('\n📋 DETAILED EVENT LOG:');
        this.results.forEach((result, i) => {
            const zoneStr = Object.entries(result.zones)
                .map(([key, value]) => `${key}:${value}`)
                .join(' ');
            console.log(`${i + 1}. ${result.event} → ${zoneStr}`);
        });
        
        // Check for the specific issue
        const hasZone2Events = this.results.some(r => r.zones.spatialZone === 2);
        const hasZone1Events = this.results.some(r => r.zones.spatialZone === 1);
        
        if (hasZone2Events && hasZone1Events) {
            console.log('❌ CROSS-CONTAMINATION CONFIRMED: Both Zone 1 and Zone 2 events detected');
        } else if (hasZone2Events) {
            console.log('✅ ZONE 2 ONLY: No cross-contamination detected');
        } else if (hasZone1Events) {
            console.log('⚠️ ZONE 1 ONLY: Check if gesture was in wrong zone');
        } else {
            console.log('❓ NO ZONE DATA: Zone information missing from events');
        }
    }
};

console.log('🔍 COMPREHENSIVE ZONE AUDIT LOADED');
console.log('Usage:');
console.log('1. zoneAudit.start()');
console.log('2. Make pinch gesture in Zone 2 (right side)');
console.log('3. zoneAudit.stop()'); 