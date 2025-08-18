'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Star, Users, TrendingUp, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
                          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Know what's in your{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  pantry
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
                Stop throwing away food and money. Pantree gives you complete visibility into your pantry, 
                helps you plan meals, and ensures you never run out of essentials again.
              </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signin"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Login Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-2">4.9/5 from 2,847 users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1: Image Left, Text Right */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 p-8">
                  <div className="h-full w-full rounded-xl bg-white shadow-2xl">
                    <div className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-3 w-20 rounded-full bg-gray-200"></div>
                        <div className="h-8 w-8 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                        <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                      </div>
                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <div className="h-16 rounded-lg bg-green-100 p-3">
                          <div className="h-3 w-12 rounded bg-green-500"></div>
                          <div className="mt-2 h-2 w-8 rounded bg-green-300"></div>
                        </div>
                        <div className="h-16 rounded-lg bg-orange-100 p-3">
                          <div className="h-3 w-10 rounded bg-orange-500"></div>
                          <div className="mt-2 h-2 w-6 rounded bg-orange-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Never waste food again
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Pantree's smart inventory system tracks every item in your pantry with real-time updates. 
                Set custom thresholds and get instant alerts when items are running low. 
                Transform your kitchen chaos into organized bliss.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Real-time inventory tracking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Smart low-stock alerts</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Family collaboration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Text Left, Image Right */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Save money, reduce stress
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Stop buying duplicates and throwing away expired food. Pantree helps you plan meals, 
                track expiration dates, and make informed shopping decisions. 
                The average family saves $600+ annually with smart pantry management.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Expiration date tracking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Shopping list generation</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Cost analysis & insights</span>
                </div>
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 p-8">
                  <div className="h-full w-full rounded-xl bg-white shadow-2xl">
                    <div className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-3 w-24 rounded-full bg-gray-200"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-6 rounded bg-green-500"></div>
                          <div className="h-6 w-6 rounded bg-yellow-500"></div>
                          <div className="h-6 w-6 rounded bg-red-500"></div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-20 rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="h-4 w-16 rounded bg-green-600"></div>
                            <div className="h-6 w-12 rounded-full bg-green-500 text-xs text-white"></div>
                          </div>
                          <div className="mt-2 h-3 w-24 rounded bg-green-300"></div>
                        </div>
                        <div className="h-20 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="h-4 w-20 rounded bg-yellow-600"></div>
                            <div className="h-6 w-8 rounded-full bg-yellow-500 text-xs text-white"></div>
                          </div>
                          <div className="mt-2 h-3 w-20 rounded bg-yellow-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Image Left, Text Right */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-8">
                  <div className="h-full w-full rounded-xl bg-white shadow-2xl">
                    <div className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-3 w-20 rounded-full bg-gray-200"></div>
                        <div className="h-8 w-8 rounded-full bg-purple-500"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                      </div>
                      <div className="mt-auto space-y-3">
                        <div className="h-12 rounded-lg bg-purple-50 p-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-purple-500"></div>
                            <div className="flex-1">
                              <div className="h-3 w-16 rounded bg-purple-600"></div>
                              <div className="mt-1 h-2 w-12 rounded bg-purple-300"></div>
                            </div>
                          </div>
                        </div>
                        <div className="h-12 rounded-lg bg-pink-50 p-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-pink-500"></div>
                            <div className="flex-1">
                              <div className="h-3 w-20 rounded bg-pink-600"></div>
                              <div className="mt-1 h-2 w-14 rounded bg-pink-300"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Work together as a family
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Everyone in your household can contribute to keeping the pantry organized. 
                Share shopping lists, track who used what, and maintain a single source of truth 
                for your family's food inventory.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Multi-user access</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Shared shopping lists</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Activity tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Save money now
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join thousands of families who have transformed their kitchen chaos into organized bliss. 
            Start saving money, reducing waste, and enjoying stress-free meal planning today.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signin"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trust Elements */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">2,847+ Users</h3>
              <p className="mt-2 text-gray-600">Trusting Pantree daily</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">$600+ Saved</h3>
              <p className="mt-2 text-gray-600">Average annual savings</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">100% Secure</h3>
              <p className="mt-2 text-gray-600">Your data is protected</p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-16 rounded-2xl bg-white p-8 shadow-xl">
            <div className="flex items-center justify-center space-x-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 text-lg text-gray-700">
              "Pantree has completely transformed how we manage our pantry. We've cut our food waste by 80% 
              and save over $100/month on groceries. It's like having a personal kitchen manager!"
            </blockquote>
            <div className="mt-4 text-sm text-gray-500">
              — Sarah M., Family of 4
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <span className="text-xl font-bold text-gray-900">Pantree</span>
          </div>
          <p className="mt-4 text-gray-600">
            Making pantry management simple and collaborative for families everywhere.
          </p>
          <div className="mt-8 flex justify-center space-x-6 text-sm text-gray-500">
            <Link href="/auth/signin" className="hover:text-gray-900">Sign In</Link>
            <Link href="/auth/register" className="hover:text-gray-900">Register</Link>
            <span>© 2025 Pantree. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
