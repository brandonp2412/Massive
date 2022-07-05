package com.massive

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView

class MainActivity : ReactActivity() {
    override fun getMainComponentName(): String? {
        return "massive"
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return MainActivityDelegate(this, mainComponentName)
    }

    class MainActivityDelegate(activity: ReactActivity?, mainComponentName: String?) :
        ReactActivityDelegate(activity, mainComponentName) {
        override fun createRootView(): ReactRootView {
            val reactRootView = ReactRootView(context)
            reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED)
            return reactRootView
        }

        override fun isConcurrentRootEnabled(): Boolean {
            return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        }
    }
}