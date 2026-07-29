//
//  SceneDelegate.swift
//  HPM
//
//  Created by Jared Counts on 7/27/26.
//
import UIKit
import Expo
import React

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

  var window: UIWindow?

  func scene(
	_ scene: UIScene,
	willConnectTo session: UISceneSession,
	options connectionOptions: UIScene.ConnectionOptions
  ) {
	guard let windowScene = (scene as? UIWindowScene) else { return }

	// Grab the existing window created by ExpoAppDelegate
	if let appDelegate = UIApplication.shared.delegate as? AppDelegate,
	   let delegateWindow = appDelegate.window {
	  
	  // Bind Expo/React Native's window directly to the active scene
	  delegateWindow.windowScene = windowScene
	  delegateWindow.backgroundColor = .systemBackground
	  
	  self.window = delegateWindow
	  delegateWindow.makeKeyAndVisible()
	}

	// Handle initial deep link on cold launch
	if let url = connectionOptions.urlContexts.first?.url {
	  RCTLinkingManager.application(UIApplication.shared, open: url, options: [:])
	}

	// Handle initial Universal Link on cold launch
	if let userActivity = connectionOptions.userActivities.first {
	  RCTLinkingManager.application(
		UIApplication.shared,
		continue: userActivity,
		restorationHandler: { _ in }
	  )
	}
  }

  // Handle custom URL scheme deep links while active/backgrounded
  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
	if let url = URLContexts.first?.url {
	  RCTLinkingManager.application(UIApplication.shared, open: url, options: [:])
	}
  }

  // Handle Universal Links while active/backgrounded
  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
	RCTLinkingManager.application(
	  UIApplication.shared,
	  continue: userActivity,
	  restorationHandler: { _ in }
	)
  }
}
