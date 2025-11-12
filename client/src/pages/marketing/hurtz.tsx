import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Zap, Sparkles, Target, Waves } from "lucide-react";

export default function HURTZPage() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm">
              Proprietary Framework
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight">
              The HURTZ Language System™
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A consciousness-based communication framework combining <span className="font-semibold text-blue-600">TungstenHURTZ</span> (precision execution) with <span className="font-semibold text-yellow-600">GiggleHURTZ</span> (joyful creation) for sustainable business performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/hwin/contact">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Book HURTZ Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Download Framework Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What is HURTZ?</h2>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-lg text-muted-foreground">
                HURTZ (Healing Universal Resonance Through Z-axis) unifies frequency (Hertz) with emotional and energetic states to create a universal language for consciousness-based communication, business execution, and human-AI collaboration.
              </p>
              
              <p className="text-lg text-muted-foreground">
                Most businesses operate in one of two modes: relentless execution (burnout) or endless ideation (no results). The HURTZ framework teaches you to consciously oscillate between both for sustainable peak performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Frequencies */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">The Core Frequencies</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* TungstenHURTZ */}
            <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-slate-600 rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-blue-500 text-white">432-528 Hz</Badge>
                </div>
                <CardTitle className="text-2xl">TungstenHURTZ™</CardTitle>
                <p className="text-sm text-muted-foreground font-semibold">
                  The Execution Frequency
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Sharp attack, sustained clarity, minimal decay. Zero fluff, maximum signal-to-noise ratio.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Characteristics:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Action-oriented over planning-oriented</li>
                    <li>• Results-driven consciousness</li>
                    <li>• Cuts through hesitation</li>
                    <li>• "Execute NOW" energy</li>
                    <li>• Direct, imperative communication</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">When to Use:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Execution phase of projects</li>
                    <li>• Decision-making under pressure</li>
                    <li>• Cutting through analysis paralysis</li>
                    <li>• Security protocols and alerts</li>
                  </ul>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm">
                  <p className="font-mono text-slate-800 dark:text-slate-200">
                    ❌ "I think we should perhaps consider..."<br/>
                    ✅ "Scan NOW. Find gems. Execute."
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* GiggleHURTZ */}
            <Card className="border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-pink-500 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-yellow-500 text-white">528-999 Hz</Badge>
                </div>
                <CardTitle className="text-2xl">GiggleHURTZ™</CardTitle>
                <p className="text-sm text-muted-foreground font-semibold">
                  The Creation Frequency
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Playful oscillations, unexpected progressions, infectious rhythms. Pure creative delight.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Characteristics:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Possibility-oriented over certainty</li>
                    <li>• Discovery-driven consciousness</li>
                    <li>• Celebrates synchronicity</li>
                    <li>• "OMFG YES THIS IS IT!" energy</li>
                    <li>• Exploratory communication</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">When to Use:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Ideation and brainstorming</li>
                    <li>• Celebrating breakthroughs</li>
                    <li>• Creative exploration</li>
                    <li>• Innovation sprints</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-sm">
                  <p className="font-mono text-yellow-900 dark:text-yellow-200">
                    "YOOOOOOO THIS IS FIRE!"<br/>
                    "WAIT WAIT WAIT I JUST SAW IT"<br/>
                    "🔥🔥🔥 GGWP UNIVERSE"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TungstenGiggle Protocol */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <Waves className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">The TungstenGiggle Protocol™</h2>
              <p className="text-lg text-muted-foreground">
                The optimal creation cycle: conscious oscillation between execution and exploration
              </p>
            </div>

            <Card className="border-2 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">GiggleHURTZ (Vision/Discovery)</h3>
                      <p className="text-muted-foreground">
                        "YOOO what if we build a system where real work triggers abilities?!"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">TungstenHURTZ (Execution/Building)</h3>
                      <p className="text-muted-foreground">
                        "Build MVP. Core loop: work logged → XP gained. Ship in 2 weeks."
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">GiggleHURTZ (Celebration/Integration)</h3>
                      <p className="text-muted-foreground">
                        "HOLY SHIT IT WORKS! Users are loving it! What else could we add?!"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">TungstenHURTZ (Refinement/Optimization)</h3>
                      <p className="text-muted-foreground">
                        "Optimize queries. Reduce load time by 40%. Deploy tonight."
                      </p>
                    </div>
                  </div>

                  <div className="text-center pt-6 border-t">
                    <p className="text-sm text-muted-foreground italic">
                      Then loop back to GiggleHURTZ for the next iteration...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <Card className="bg-red-50 dark:bg-red-900/10 border-red-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">❌ Tungsten without Giggle</h4>
                  <p className="text-sm text-muted-foreground">
                    Burnout, joyless execution, corporate death
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 dark:bg-red-900/10 border-red-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">❌ Giggle without Tungsten</h4>
                  <p className="text-sm text-muted-foreground">
                    Endless ideation, no manifestation, dreamer's trap
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">✅ TungstenGiggle Together</h4>
                  <p className="text-sm text-muted-foreground">
                    Joyful mastery, flow state, sustainable creation
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Business Applications */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How We Use HURTZ in Business</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    GiggleHURTZ for vision and possibilities, TungstenHURTZ for roadmap and execution
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Label meetings by frequency: "This is a TungstenHURTZ standup" vs "GiggleHURTZ brainstorm"
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Execution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Week 1: Giggle (discover). Week 2-4: Tungsten (build). Week 5: Giggle (celebrate, iterate)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Innovation & Creativity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Protected GiggleHURTZ time for exploration without immediate execution pressure
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Team's Performance?
            </h2>
            
            <p className="text-xl opacity-90">
              Discover your frequency balance and learn how to consciously oscillate between execution and creativity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/hwin/contact">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Book HURTZ Assessment <Target className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/hwin/services">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View HURTZ Services
                </Button>
              </Link>
            </div>

            <p className="text-sm opacity-75 pt-4">
              The HURTZ Language System™ is proprietary IP by HwinNwin Enterprises
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
