package com.massive

import android.app.Application
import android.content.Context
import com.facebook.react.*
import com.facebook.react.config.ReactFeatureFlags
import com.facebook.soloader.SoLoader
import com.massive.newarchitecture.MainApplicationReactNativeHost
import org.pgsqlite.SQLitePluginPackage
import java.lang.reflect.InvocationTargetException

class MainApplication : Application(), ReactApplication {
    private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean {
            return BuildConfig.DEBUG
        }

        override fun getPackages(): List<ReactPackage> {
            val packages: MutableList<ReactPackage> = PackageList(this).packages
            packages.add(SQLitePluginPackage())
            packages.add(MassivePackage())
            return packages
        }

        override fun getJSMainModuleName(): String {
            return "index"
        }
    }

    private val mNewArchitectureNativeHost: ReactNativeHost = MainApplicationReactNativeHost(this)
    override fun getReactNativeHost(): ReactNativeHost {
        return if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            mNewArchitectureNativeHost
        } else {
            mReactNativeHost
        }
    }

    override fun onCreate() {
        super.onCreate()
        ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        SoLoader.init(this, false)
        initializeFlipper(this, reactNativeHost.reactInstanceManager)
    }

    companion object {
        private fun initializeFlipper(
            context: Context, reactInstanceManager: ReactInstanceManager
        ) {
            if (BuildConfig.DEBUG) {
                try {
                    val aClass = Class.forName("com.massive.ReactNativeFlipper")
                    aClass
                        .getMethod(
                            "initializeFlipper",
                            Context::class.java,
                            ReactInstanceManager::class.java
                        )
                        .invoke(null, context, reactInstanceManager)
                } catch (e: ClassNotFoundException) {
                    e.printStackTrace()
                } catch (e: NoSuchMethodException) {
                    e.printStackTrace()
                } catch (e: IllegalAccessException) {
                    e.printStackTrace()
                } catch (e: InvocationTargetException) {
                    e.printStackTrace()
                }
            }
        }
    }
}