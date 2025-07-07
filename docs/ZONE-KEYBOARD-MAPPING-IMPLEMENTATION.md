# 🗺️ ZONE-BASED KEYBOARD MAPPING SYSTEM - TECHNICAL SPECIFICATION

**Version:** v1.0.0  
**Date:** July 1, 2025  
**Author:** AI Assistant & User Collaboration  
**Purpose:** Replace hand-based Piano Genie mapping with zone-based spatial mapping  
**Status:** 📋 PHASE 1 - DOCUMENTATION & FEEDBACK

---

## 📋 EXECUTIVE SUMMARY

This document specifies the implementation of a Zone-Based Keyboard Mapping System that replaces unreliable hand detection with screen position zones for Piano Genie keyboard mapping. The system follows existing architectural patterns and integrates seamlessly with the current event-driven infrastructure.

**Core Concept:** Transform `(hand * 4) + finger` logic into `(zone * 4) + finger` logic for reliable spatial control.

---

## 🎯 REQUIREMENTS ANALYSIS

### **🚫 PROBLEMS TO SOLVE:**
- **MediaPipe Hand Detection:** Unreliable handedness classification 
- **Hand Switching:** Users can't control which hand is "left" vs "right"
- **Spatial Logic:** User's screen position should determine zone, not AI guessing

### **✅ SOLUTION APPROACH:**
- **Zone Detection:** Already working (`window.mediaPipeCamera.testZoneDetection()`)
- **User Control:** Pinch left side = Zone 1, pinch right side = Zone 2
- **Predictable Mapping:** Same finger always maps to predictable keys based on zone
- **Customizable:** User can remap any zone+finger combination to any keyboard key

---

## 🏗️ SYSTEM ARCHITECTURE

### **📊 CURRENT STATE ANALYSIS:**
```javascript
// ✅ ZONE DETECTION: Already working
window.mediaPipeCamera.testZoneDetection(0.25, 0.5) 
// → {zoneId: 'zone-left', zoneName: 'Zone 1 (Left)', position: {x: 0.25, y: 0.5}}

// ✅ PIANO GENIE BRIDGE: Already working  
initializePianoGenieEventBridge()
window.gcFreeOrchestrator.on('pinchState', pianoGenieEventBridge)

// ❌ CURRENT MAPPING: Hand-based (unreliable)
fingerIndex = (data.hand * 4) + data.finger  // Problems: hand detection unreliable

// ✅ TARGET MAPPING: Zone-based (reliable)  
fingerIndex = (zoneIndex * 4) + data.finger  // Solution: user controls zone by position
```

### **🗺️ ZONE MAPPING LOGIC:**
```javascript
// Zone Detection Results:
// Left side (x < 0.5)  → zoneId: 'zone-left'  → zoneIndex: 0
// Right side (x >= 0.5) → zoneId: 'zone-right' → zoneIndex: 1

// Default Key Mapping:
Zone 1 (Left Side)      Zone 2 (Right Side)
- Pinky  → A (key 0)    - Index  → J (key 4)  
- Ring   → S (key 1)    - Middle → K (key 5)
- Middle → D (key 2)    - Ring   → L (key 6)
- Index  → F (key 3)    - Pinky  → ; (key 7)
```

---

## 🔧 IMPLEMENTATION SPECIFICATION

### **📦 MODULE STRUCTURE: `ZoneKeyMappingModule`**

Following your exact dependency injection pattern:

```javascript
/**
 * 🗺️ ZONE-BASED KEYBOARD MAPPING MODULE
 * Converts zone+finger combinations to keyboard keys for Piano Genie
 */
class ZoneKeyMappingModule {
    constructor(dependencies = {}) {
        // ✅ FOLLOW EXISTING PATTERN: Dependency injection
        this.logger = dependencies.logger || window.Logger;
        this.settings = dependencies.settings || window.UnifiedSettingsManager;
        this.orchestrator = dependencies.orchestrator || window.gcFreeOrchestrator;
        
        // Module state
        this.isInitialized = false;
        this.currentMappings = null;
        
        // ✅ FOLLOW EXISTING PATTERN: Module initialization
        this.initialize();
    }
    
    initialize() {
        try {
            this.loadMappings();
            this.setupEventListeners();
            this.isInitialized = true;
            
            // ✅ FOLLOW EXISTING PATTERN: Logger.system for module status
            this.logger.system('🗺️ ZoneKeyMappingModule: Initialized successfully');
        } catch (error) {
            // ✅ FOLLOW EXISTING PATTERN: Logger.error for failures
            this.logger.error('🚨 ZoneKeyMappingModule: Initialization failed', error);
        }
    }
}
```

### **⚙️ CORE FUNCTIONS:**

```javascript
/**
 * Transform zone+finger data to Piano Genie key index
 * @param {Object} enrichedData - Pinch data with zone information
 * @returns {number} Piano Genie key index (0-7)
 */
transformToKeyIndex(enrichedData) {
    const { zoneId, finger } = enrichedData;
    const zoneIndex = zoneId === 'zone-left' ? 0 : 1;
    
    // ✅ TRANSFORM: (hand * 4) + finger → (zone * 4) + finger
    return (zoneIndex * 4) + finger;
}

/**
 * Get current key mapping for zone+finger combination
 * @param {string} zoneId - 'zone-left' or 'zone-right'
 * @param {number} finger - 0=pinky, 1=ring, 2=middle, 3=index
 * @returns {string} Keyboard key ('A', 'S', 'D', etc.)
 */
getCurrentZoneKeyMapping(zoneId, finger) {
    // ✅ FOLLOW EXISTING PATTERN: UnifiedSettingsManager
    const mappings = this.settings.load('ZONE_KEYBOARD', 'mappings') || this.getDefaultMappings();
    const keyIndex = this.transformToKeyIndex({ zoneId, finger });
    return mappings[keyIndex];
}

/**
 * Save custom key mapping
 * @param {string} zoneId - 'zone-left' or 'zone-right' 
 * @param {number} finger - 0=pinky, 1=ring, 2=middle, 3=index
 * @param {string} key - Target keyboard key
 */
setZoneKeyMapping(zoneId, finger, key) {
    const mappings = this.settings.load('ZONE_KEYBOARD', 'mappings') || this.getDefaultMappings();
    const keyIndex = this.transformToKeyIndex({ zoneId, finger });
    
    mappings[keyIndex] = key;
    
    // ✅ FOLLOW EXISTING PATTERN: UnifiedSettingsManager.save
    this.settings.save('ZONE_KEYBOARD', 'mappings', mappings);
    
    // ✅ FOLLOW EXISTING PATTERN: Logger.system with throttling  
    this.logger.throttle('zone-mapping-update', () => {
        this.logger.system(`🗺️ Zone Mapping: ${zoneId} ${finger} → ${key}`);
    }, 2000);
}
```

### **🎹 PIANO GENIE INTEGRATION:**

```javascript
/**
 * Enhanced Piano Genie Event Bridge with Zone Support
 * Replaces existing pianoGenieEventBridge function
 */
createZoneEnhancedPianoGenieBridge() {
    return (data) => {
        try {
            // ✅ ZONE ENRICHMENT: Add zone data to pinch events
            const enrichedData = this.enrichWithZoneData(data);
            
            if (!enrichedData.zoneId) {
                // ✅ FOLLOW EXISTING PATTERN: Logger.warn for issues
                this.logger.warn('⚠️ Zone Mapping: No zone detected, skipping');
                return;
            }
            
            // ✅ TRANSFORM: Zone+finger → keyboard key
            const keyMapping = this.getCurrentZoneKeyMapping(enrichedData.zoneId, enrichedData.finger);
            
            // ✅ INTEGRATION: Send to existing Piano Genie system
            this.sendToPianoGenie(keyMapping, enrichedData);
            
        } catch (error) {
            // ✅ FOLLOW EXISTING PATTERN: Logger.error with context
            this.logger.error('🚨 Zone Piano Genie Bridge: Error processing', { data, error });
        }
    };
}

/**
 * Enrich pinch data with zone information
 * @param {Object} data - Original pinch data from gcFreeOrchestrator
 * @returns {Object} Enhanced data with zoneId and zoneName
 */
enrichWithZoneData(data) {
    if (!data.position || !window.mediaPipeCamera) {
        return data;
    }
    
    // ✅ USE EXISTING SYSTEM: mediaPipeCamera.testZoneDetection
    const zoneResult = window.mediaPipeCamera.testZoneDetection(data.position.x, data.position.y);
    
    return {
        ...data,
        zoneId: zoneResult?.zoneId,
        zoneName: zoneResult?.zoneName,
        zonePosition: zoneResult?.position
    };
}
```

---

## 💾 DATA STRUCTURES & PERSISTENCE

### **⚙️ SETTINGS STRUCTURE:**

Following your UnifiedSettingsManager patterns:

```javascript
// ✅ FOLLOW EXISTING PATTERN: Category-based settings
UnifiedSettingsManager.save('ZONE_KEYBOARD', 'mappings', {
    0: 'A',  // Zone 1 (Left) - Pinky
    1: 'S',  // Zone 1 (Left) - Ring  
    2: 'D',  // Zone 1 (Left) - Middle
    3: 'F',  // Zone 1 (Left) - Index
    4: 'J',  // Zone 2 (Right) - Index
    5: 'K',  // Zone 2 (Right) - Middle
    6: 'L',  // Zone 2 (Right) - Ring
    7: ';'   // Zone 2 (Right) - Pinky
});

UnifiedSettingsManager.save('ZONE_KEYBOARD', 'enabled', true);
UnifiedSettingsManager.save('ZONE_KEYBOARD', 'allowDuplicates', true);
UnifiedSettingsManager.save('ZONE_KEYBOARD', 'visualFeedback', true);
```

### **📊 EVENT DATA STRUCTURE:**

```javascript
// Enhanced pinch event with zone data
{
    eventType: 'pinchStart',
    hand: 1,                    // Keep for compatibility
    finger: 2,                  // 0=pinky, 1=ring, 2=middle, 3=index
    distance: 45.2,             // Distance in mm
    velocity: 67,               // 0-127 MIDI velocity
    position: { x: 0.25, y: 0.5 }, // Normalized coordinates
    
    // ✅ NEW: Zone enrichment data
    zoneId: 'zone-left',        // 'zone-left' or 'zone-right'
    zoneName: 'Zone 1 (Left)',  // Human-readable name
    zonePosition: { x: 0.25, y: 0.5 }, // Zone-relative position
    
    // ✅ NEW: Key mapping result
    targetKey: 'D',             // Resolved keyboard key
    keyIndex: 2,                // Piano Genie key index (0-7)
    
    timestamp: Date.now()
}
```

---

## 🎨 USER INTERFACE SPECIFICATION

### **🛠️ CONFIGURATION PANEL:**

Add to existing accordion system:

```html
<!-- ✅ FOLLOW EXISTING PATTERN: Accordion card structure -->
<div class="accordion-item" id="zone-mapping-card">
    <div class="accordion-header">
        <h3>🗺️ Zone Keyboard Mapping</h3>
        <div class="accordion-toggle">▼</div>
    </div>
    <div class="accordion-content">
        <div class="zone-mapping-grid">
            <!-- Zone 1 (Left) -->
            <div class="zone-section">
                <h4>Zone 1 (Left Side)</h4>
                <div class="finger-mappings">
                    <div class="mapping-row">
                        <label>Pinky:</label>
                        <input type="text" id="zone1-pinky" value="A" maxlength="1">
                    </div>
                    <div class="mapping-row">
                        <label>Ring:</label>
                        <input type="text" id="zone1-ring" value="S" maxlength="1">
                    </div>
                    <div class="mapping-row">
                        <label>Middle:</label>
                        <input type="text" id="zone1-middle" value="D" maxlength="1">
                    </div>
                    <div class="mapping-row">
                        <label>Index:</label>
                        <input type="text" id="zone1-index" value="F" maxlength="1">
                    </div>
                </div>
            </div>
            
            <!-- Zone 2 (Right) -->
            <div class="zone-section">
                <h4>Zone 2 (Right Side)</h4>
                <div class="finger-mappings">
                    <div class="mapping-row">
                        <label>Index:</label>
                        <input type="text" id="zone2-index" value="J" maxlength="1">
                    </div>
                    <div class="mapping-row">
                        <label>Middle:</label>
                        <input type="text" id="zone2-middle" value="K" maxlength="1">
                    </div>
                    <div class="mapping-row">
                        <label>Ring:</label>
                        <input type="text" id="zone2-ring" value="L" maxlength="1">
                    </div>
                    <div class="mapping-row">
                        <label>Pinky:</label>
                        <input type="text" id="zone2-pinky" value=";" maxlength="1">
                    </div>
                </div>
            </div>
        </div>
        
        <div class="zone-controls">
            <button onclick="resetZoneMappings()">Reset to Default</button>
            <button onclick="testZoneMappings()">Test Current Mapping</button>
        </div>
    </div>
</div>
```

### **📱 VISUAL FEEDBACK:**

```javascript
/**
 * Show visual feedback when zone+finger mapping triggers
 * @param {string} zoneId - 'zone-left' or 'zone-right'
 * @param {number} finger - 0-3 finger index
 * @param {string} key - Target keyboard key
 */
showZoneMappingFeedback(zoneId, finger, key) {
    // ✅ FOLLOW EXISTING PATTERN: Visual feedback system
    const feedbackElement = document.getElementById('zone-feedback');
    if (feedbackElement) {
        feedbackElement.textContent = `${zoneId === 'zone-left' ? 'Zone 1' : 'Zone 2'} ${this.getFingerName(finger)} → ${key}`;
        feedbackElement.classList.add('active');
        
        // ✅ FOLLOW EXISTING PATTERN: Timeout cleanup
        setTimeout(() => {
            feedbackElement.classList.remove('active');
        }, 1000);
    }
}
```

---

## 🧪 TESTING STRATEGY

### **📊 DIAGNOSTIC FUNCTIONS:**

```javascript
/**
 * Test zone detection and key mapping
 * @param {number} x - Normalized x coordinate (0-1)
 * @param {number} y - Normalized y coordinate (0-1) 
 * @param {number} finger - Finger index (0-3)
 */
function testZoneKeyMapping(x = 0.25, y = 0.5, finger = 2) {
    // ✅ FOLLOW EXISTING PATTERN: Logger.system for test output
    Logger.system('🧪 ZONE KEY MAPPING TEST');
    Logger.system('═══════════════════════════════');
    
    // Test zone detection
    const zoneResult = window.mediaPipeCamera.testZoneDetection(x, y);
    Logger.system(`📍 Position (${x}, ${y}) → ${zoneResult.zoneName}`);
    
    // Test key mapping
    const keyMapping = getCurrentZoneKeyMapping(zoneResult.zoneId, finger);
    Logger.system(`🎹 ${zoneResult.zoneName} ${getFingerName(finger)} → Key: ${keyMapping}`);
    
    // Test Piano Genie integration
    const mockData = {
        eventType: 'pinchStart',
        hand: zoneResult.zoneId === 'zone-left' ? 0 : 1,
        finger: finger,
        position: { x, y },
        distance: 45.0,
        velocity: 64,
        timestamp: Date.now()
    };
    
    const enrichedData = enrichWithZoneData(mockData);
    Logger.system(`🎵 Enhanced Event:`, enrichedData);
    
    return {
        zone: zoneResult,
        keyMapping: keyMapping,
        enrichedData: enrichedData
    };
}

/**
 * Complete zone mapping diagnostic
 */
function diagnosticZoneMapping() {
    Logger.system('🔍 COMPLETE ZONE MAPPING DIAGNOSTIC');
    Logger.system('═════════════════════════════════════');
    
    // Test all combinations
    const zones = [
        { id: 'zone-left', x: 0.25, name: 'Zone 1 (Left)' },
        { id: 'zone-right', x: 0.75, name: 'Zone 2 (Right)' }
    ];
    
    const fingers = ['Pinky', 'Ring', 'Middle', 'Index'];
    
    zones.forEach(zone => {
        Logger.system(`\n🗺️ ${zone.name}:`);
        fingers.forEach((fingerName, fingerIndex) => {
            const result = testZoneKeyMapping(zone.x, 0.5, fingerIndex);
            Logger.system(`  ${fingerName} → ${result.keyMapping}`);
        });
    });
    
    Logger.system('\n✅ Zone mapping diagnostic complete');
}
```

### **🔧 INTEGRATION TESTING:**

```javascript
/**
 * Test integration with existing Piano Genie system
 */
function testZonePianoGenieIntegration() {
    Logger.system('🎹 ZONE PIANO GENIE INTEGRATION TEST');
    Logger.system('════════════════════════════════════');
    
    // Check Piano Genie bridge status
    const bridgeActive = !!(window.pianoGenieEventBridge);
    Logger.system(`🔗 Piano Genie Bridge: ${bridgeActive ? 'Active' : 'Inactive'}`);
    
    if (!bridgeActive) {
        Logger.warn('⚠️ Piano Genie bridge not active - run initializePianoGenieEventBridge()');
        return;
    }
    
    // Test zone-enhanced bridge
    Logger.system('🧪 Testing zone-enhanced events...');
    
    // Simulate pinch events in different zones
    const testEvents = [
        { x: 0.25, y: 0.5, finger: 2 }, // Zone 1, Middle finger
        { x: 0.75, y: 0.5, finger: 1 }, // Zone 2, Ring finger
    ];
    
    testEvents.forEach((event, index) => {
        setTimeout(() => {
            const result = testZoneKeyMapping(event.x, event.y, event.finger);
            Logger.system(`🎵 Test ${index + 1}: ${result.zone.zoneName} ${getFingerName(event.finger)} → ${result.keyMapping}`);
        }, index * 1000);
    });
}
```

---

## 📋 IMPLEMENTATION ROADMAP

### **🎯 PHASE 1: DOCUMENTATION & FEEDBACK ✅**
- [x] Complete technical specification
- [x] Document integration points
- [x] Define data structures and APIs
- [ ] **GET USER FEEDBACK AND APPROVAL**

### **🧪 PHASE 2: PROTOTYPE & DIAGNOSTICS**
- [ ] Create diagnostic functions for live testing
- [ ] Test zone detection with real pinch events
- [ ] Validate key mapping logic with console output
- [ ] Test Piano Genie integration compatibility

### **🔧 PHASE 3: IMPLEMENTATION**
- [ ] Create `ZoneKeyMappingModule` class
- [ ] Implement zone enrichment decorator
- [ ] Replace existing Piano Genie bridge with zone-enhanced version
- [ ] Add configuration UI to accordion system

### **✅ PHASE 4: VALIDATION & DELIVERY** 
- [ ] Test with real hand tracking and Piano Genie
- [ ] Validate settings persistence across browser reloads
- [ ] Test user customization interface
- [ ] Document final implementation and update version

---

## 🚨 RISK MITIGATION

### **⚠️ POTENTIAL ISSUES:**
1. **Zone Boundary Edge Cases:** Users pinching exactly at screen center
2. **Performance Impact:** Zone detection adding latency to pinch events
3. **Settings Migration:** Existing Piano Genie users losing their setup
4. **UI Complexity:** Too many customization options overwhelming users

### **✅ MITIGATION STRATEGIES:**
1. **Boundary Handling:** Default to Zone 2 (right) for center positions
2. **Performance:** Cache zone results, use existing MediaPipe detection
3. **Migration:** Preserve existing mappings, make zone system opt-in initially
4. **UI Design:** Start with simple presets, advanced customization optional

---

## 📚 REFERENCES & DEPENDENCIES

### **🔗 EXISTING SYSTEMS:**
- **Zone Detection:** `window.mediaPipeCamera.testZoneDetection(x, y)`
- **Piano Genie Bridge:** `initializePianoGenieEventBridge()`, `cleanupPianoGenieEventBridge()`
- **Settings:** `UnifiedSettingsManager.save/load('category', 'key', value)`
- **Logging:** `Logger.system/warn/error()`, `Logger.throttle(key, fn, interval)`
- **Events:** `window.gcFreeOrchestrator.emit/on('pinchState', handler)`

### **📦 MODULE DEPENDENCIES:**
- **GCFreeOrchestrator:** Event system and pinch data
- **MediaPipeCameraInput:** Zone detection functionality  
- **UnifiedSettingsManager:** Settings persistence
- **Logger:** Consistent logging with throttling
- **Piano Genie System:** Target integration point

---

**🎯 STATUS: Ready for Phase 2 - Prototype & Diagnostics**

**Next Steps:** Create diagnostic code for live testing with real zone detection and pinch events.