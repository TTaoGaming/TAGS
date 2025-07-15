/**
 * 🔍 SIMPLE ZONE DIAGNOSTIC - THROTTLED FOR CLEAN RESULTS
 * Non-spammy version that produces clean, copy-pasteable analysis
 */

class SimpleZoneDiagnostic {
    constructor() {
        this.results = [];
        this.isTracking = false;
        this.lastEmit = 0;
        this.throttleMs = 100; // Only log every 100ms
        this.maxResults = 20;   // Limit to 20 events
        this.startTime = null;
        
        this.init();
    }
    
    init() {
        this.setupThrottledEventCapture();
        this.createSimpleUI();
    }
    
    setupThrottledEventCapture() {
        if (!window.gcFreeOrchestrator) {
            console.error('🔍 gcFreeOrchestrator not found');
            return;
        }
        
        const originalEmit = window.gcFreeOrchestrator.emit;
        
        window.gcFreeOrchestrator.emit = (eventType, data) => {
            if (this.isTracking && this.shouldCapture(eventType, data)) {
                this.captureEvent(eventType, data);
            }
            return originalEmit.call(window.gcFreeOrchestrator, eventType, data);
        };
    }
    
    shouldCapture(eventType, data) {
        const now = Date.now();
        
        // Only capture zone-related events
        const zoneEvents = ['pinchState', 'audio', 'midi'];
        if (!zoneEvents.includes(eventType)) return false;
        
        // Throttle to prevent spam
        if (now - this.lastEmit < this.throttleMs) return false;
        
        // Must have zone information
        if (!this.hasZoneInfo(data)) return false;
        
        this.lastEmit = now;
        return true;
    }
    
    hasZoneInfo(data) {
        if (!data) return false;
        return data.zone !== undefined || 
               data.spatialZone !== undefined || 
               data.zoneName !== undefined ||
               data.hand !== undefined ||
               (data.position && data.position.x !== undefined);
    }
    
    captureEvent(eventType, data) {
        if (this.results.length >= this.maxResults) {
            this.results.shift(); // Remove oldest
        }
        
        const timestamp = Date.now();
        const relativeTime = this.startTime ? timestamp - this.startTime : 0;
        
        const result = {
            time: relativeTime,
            event: eventType,
            zone: this.extractZone(data),
            rawData: this.extractRelevantData(data)
        };
        
        this.results.push(result);
        this.updateUI();
    }
    
    extractZone(data) {
        // Try multiple zone detection methods
        const zones = {};
        
        if (data.zone !== undefined) zones.zone = data.zone;
        if (data.spatialZone !== undefined) zones.spatialZone = data.spatialZone;
        if (data.zoneName !== undefined) zones.zoneName = data.zoneName;
        if (data.hand !== undefined) zones.hand = data.hand === 0 ? 1 : 2;
        if (data.position?.x !== undefined) zones.position = data.position.x < 0.5 ? 1 : 2;
        
        return zones;
    }
    
    extractRelevantData(data) {
        const relevant = {};
        
        if (data.finger !== undefined) relevant.finger = data.finger;
        if (data.hand !== undefined) relevant.hand = data.hand;
        if (data.position) relevant.position = `${data.position.x?.toFixed(2)},${data.position.y?.toFixed(2)}`;
        if (data.action) relevant.action = data.action;
        if (data.eventType) relevant.eventType = data.eventType;
        
        return relevant;
    }
    
    createSimpleUI() {
        const container = document.createElement('div');
        container.id = 'simpleZoneDiagnostic';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            border: 2px solid #007AFF;
            border-radius: 8px;
            padding: 15px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 12px;
            z-index: 9999;
            display: none;
        `;
        
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #007AFF;">🔍 Zone Diagnostic</h3>
                <button id="startSimpleTrace" style="background: #34C759; color: white; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px;">START</button>
                <button id="stopSimpleTrace" style="background: #FF3B30; color: white; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px;">STOP</button>
                <button id="copyResults" style="background: #007AFF; color: white; border: none; padding: 6px 12px; border-radius: 4px;">COPY</button>
            </div>
            
            <div id="simpleStatus" style="margin-bottom: 10px; padding: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; font-size: 11px;">
                Ready - Click START, pinch in Zone 2, then STOP
            </div>
            
            <div id="simpleResults" style="max-height: 200px; overflow-y: auto; background: rgba(255, 255, 255, 0.05); padding: 8px; border-radius: 4px; font-size: 11px;">
                <em>No results yet</em>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Add event listeners
        document.getElementById('startSimpleTrace').onclick = () => this.start();
        document.getElementById('stopSimpleTrace').onclick = () => this.stop();
        document.getElementById('copyResults').onclick = () => this.copyResults();
    }
    
    start() {
        this.isTracking = true;
        this.results = [];
        this.startTime = Date.now();
        
        document.getElementById('simpleStatus').textContent = 'TRACKING - Make pinch gesture in Zone 2 (right side)';
        document.getElementById('simpleStatus').style.background = 'rgba(52, 199, 89, 0.2)';
        document.getElementById('simpleResults').innerHTML = '<em>Waiting for zone events...</em>';
        
        console.log('🔍 Simple Zone Diagnostic: Tracking started');
    }
    
    stop() {
        this.isTracking = false;
        
        document.getElementById('simpleStatus').textContent = `Complete - Captured ${this.results.length} zone events`;
        document.getElementById('simpleStatus').style.background = 'rgba(0, 122, 255, 0.2)';
        
        this.generateSummary();
        
        console.log('🔍 Simple Zone Diagnostic: Tracking stopped');
    }
    
    updateUI() {
        const resultsDiv = document.getElementById('simpleResults');
        if (!resultsDiv) return;
        
        if (this.results.length === 0) {
            resultsDiv.innerHTML = '<em>No results yet</em>';
            return;
        }
        
        const html = this.results.map(result => {
            const zoneInfo = Object.entries(result.zone)
                .map(([key, value]) => `${key}:${value}`)
                .join(' ');
            
            return `<div style="margin: 2px 0; padding: 3px; background: rgba(255,255,255,0.03);">
                +${result.time}ms ${result.event} → ${zoneInfo}
            </div>`;
        }).join('');
        
        resultsDiv.innerHTML = html;
        resultsDiv.scrollTop = resultsDiv.scrollHeight;
    }
    
    generateSummary() {
        const summary = this.analyzeCrossZoneContamination();
        const resultsDiv = document.getElementById('simpleResults');
        
        const summaryHtml = `
            <div style="border-top: 1px solid #333; margin-top: 10px; padding-top: 10px;">
                <strong>📊 ANALYSIS:</strong><br>
                Total Events: ${this.results.length}<br>
                Zone 1 Events: ${summary.zone1Count}<br>
                Zone 2 Events: ${summary.zone2Count}<br>
                Cross-Contamination: ${summary.contamination ? '❌ DETECTED' : '✅ None'}<br>
                Conflicting Systems: ${summary.conflicts.length > 0 ? '❌ ' + summary.conflicts.join(', ') : '✅ None'}
            </div>
        `;
        
        resultsDiv.innerHTML += summaryHtml;
    }
    
    analyzeCrossZoneContamination() {
        const zone1Count = this.results.filter(r => 
            Object.values(r.zone).includes(1) || 
            Object.values(r.zone).includes('Zone 1 (Left)')
        ).length;
        
        const zone2Count = this.results.filter(r => 
            Object.values(r.zone).includes(2) || 
            Object.values(r.zone).includes('Zone 2 (Right)')
        ).length;
        
        const contamination = zone1Count > 0 && zone2Count > 0;
        
        const conflicts = [];
        this.results.forEach(result => {
            const zoneValues = Object.values(result.zone);
            if (zoneValues.includes(1) && zoneValues.includes(2)) {
                conflicts.push('MIXED_ZONES');
            }
        });
        
        return {
            zone1Count,
            zone2Count,
            contamination,
            conflicts: [...new Set(conflicts)]
        };
    }
    
    copyResults() {
        const copyText = this.generateCopyText();
        
        navigator.clipboard.writeText(copyText).then(() => {
            document.getElementById('copyResults').textContent = 'COPIED!';
            document.getElementById('copyResults').style.background = '#34C759';
            
            setTimeout(() => {
                document.getElementById('copyResults').textContent = 'COPY';
                document.getElementById('copyResults').style.background = '#007AFF';
            }, 2000);
            
            console.log('🔍 Zone diagnostic results copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
    
    generateCopyText() {
        const summary = this.analyzeCrossZoneContamination();
        
        let text = `🔍 ZONE DIAGNOSTIC RESULTS\n`;
        text += `═══════════════════════════\n`;
        text += `Total Events: ${this.results.length}\n`;
        text += `Zone 1 Events: ${summary.zone1Count}\n`;
        text += `Zone 2 Events: ${summary.zone2Count}\n`;
        text += `Cross-Contamination: ${summary.contamination ? 'DETECTED' : 'None'}\n`;
        text += `Conflicting Systems: ${summary.conflicts.length > 0 ? summary.conflicts.join(', ') : 'None'}\n\n`;
        
        text += `DETAILED EVENT LOG:\n`;
        text += `═══════════════════\n`;
        
        this.results.forEach(result => {
            const zoneInfo = Object.entries(result.zone)
                .map(([key, value]) => `${key}:${value}`)
                .join(' ');
            
            text += `+${result.time}ms ${result.event} → ${zoneInfo}\n`;
        });
        
        return text;
    }
    
    show() {
        document.getElementById('simpleZoneDiagnostic').style.display = 'block';
    }
    
    hide() {
        document.getElementById('simpleZoneDiagnostic').style.display = 'none';
    }
}

// Initialize simple diagnostic
window.simpleZoneDiagnostic = new SimpleZoneDiagnostic();

// Global functions
window.showSimpleZoneDiagnostic = () => window.simpleZoneDiagnostic.show();
window.hideSimpleZoneDiagnostic = () => window.simpleZoneDiagnostic.hide();

// Auto-show if requested
if (window.location.search.includes('simple-zone=true')) {
    window.simpleZoneDiagnostic.show();
}

console.log('🔍 SIMPLE ZONE DIAGNOSTIC LOADED');
console.log('🚀 Use: showSimpleZoneDiagnostic() to start');
console.log('💡 Or add ?simple-zone=true to URL for auto-show'); 