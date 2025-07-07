module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    // =============================================
    // EVENT-DRIVEN ARCHITECTURE ENFORCEMENT
    // =============================================
    
    // Phase 1: Warnings (gradual transition)
    "no-restricted-globals": ["warn", {
      "name": "window",
      "message": "⚠️  MIGRATION: Use eventBus.emit() instead of window.globalState access. See transition guide."
    }],
    
    // Phase 2: Prevent new global variable creation
    "no-implicit-globals": "error",
    "no-global-assign": "error",
    
    // Phase 3: Enforce event naming convention
    "prefer-const": "error",
    
    // Custom rules for event-driven patterns
    "no-console": ["warn", { 
      "allow": ["warn", "error", "info"] 
    }]
  },
  
  // =============================================
  // MIGRATION PHASES (Uncomment as you progress)
  // =============================================
  
  "overrides": [
    {
      // Phase 1: Allow legacy patterns with warnings
      "files": ["**/*.html", "**/*.js"],
      "rules": {
        "no-restricted-globals": ["warn", "window", "global"],
        "no-restricted-syntax": [
          "warn",
          {
            "selector": "MemberExpression[object.name='window'][property.name='wristOrientationData']",
            "message": "🔄 MIGRATE: Replace window.wristOrientationData with eventBus.subscribe('wrist.orientation.changed')"
          },
          {
            "selector": "MemberExpression[object.name='window'][property.name='gcFreeOrchestrator']", 
            "message": "🔄 MIGRATE: Use injected eventBus instead of window.gcFreeOrchestrator"
          },
          {
            "selector": "CallExpression[callee.name='getCurrentPositionFromHandsFree']",
            "message": "🔄 MIGRATE: Replace direct call with eventBus.emit('hand.position.request')"
          }
        ]
      }
    }
    
    // Phase 2: Stricter enforcement (uncomment when ready)
    // {
    //   "files": ["**/modules/**/*.js"],
    //   "rules": {
    //     "no-restricted-globals": ["error", "window", "global"],
    //     "no-restricted-syntax": ["error", "MemberExpression[object.name='window']"]
    //   }
    // }
    
    // Phase 3: Event-only enforcement (final phase)
    // {
    //   "files": ["**/modules/**/*.js"],
    //   "rules": {
    //     "no-restricted-syntax": [
    //       "error",
    //       "MemberExpression[object.name='window']",
    //       "CallExpression[callee.type!='MemberExpression'][callee.property.name!='emit'][callee.property.name!='subscribe']"
    //     ]
    //   }
    // }
  ],
  
  // =============================================
  // MIGRATION HELPER COMMENTS
  // =============================================
  
  "settings": {
    "migration-patterns": {
      "global-to-event": {
        "window.wrisOrientationData[hand]": "eventBus.emit('wrist.orientation.request', {hand})",
        "getCurrentPositionFromHandsFree(hand, finger)": "eventBus.emit('hand.position.request', {hand, finger})",
        "window.gcFreeOrchestrator.emit()": "this.eventBus.emit()"
      }
    }
  }
} 