import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, AlertTriangle, Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  answers: { text: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "Où sont stockées vos données critiques ?",
    answers: [
      { text: "Dans plusieurs sites ou datacenters redondés", score: 1 },
      { text: "Sur un cloud unique (AWS, OVH, etc.)", score: 2 },
      { text: "Sur un serveur local sans redondance externe", score: 3 },
    ],
  },
  {
    id: 2,
    question: "Quelle est la fréquence de vos sauvegardes ?",
    answers: [
      { text: "Quotidienne ou en continu", score: 1 },
      { text: "Hebdomadaire ou irrégulière", score: 2 },
      { text: "Moins d'une fois par semaine", score: 3 },
    ],
  },
  {
    id: 3,
    question: "Disposez-vous d'un PRA testé récemment ?",
    answers: [
      { text: "Oui, testé dans les 12 derniers mois", score: 1 },
      { text: "Oui, mais jamais testé ou partiellement", score: 2 },
      { text: "Non, aucun PRA formel", score: 3 },
    ],
  },
  {
    id: 4,
    question: "Êtes-vous dépendant d'un seul site ou fournisseur ?",
    answers: [
      { text: "Non, plusieurs sites ou fournisseurs", score: 1 },
      { text: "Oui, un seul fournisseur (cloud ou local)", score: 2 },
      { text: "Oui, un seul site physique", score: 3 },
    ],
  },
  {
    id: 5,
    question: "Vos sauvegardes sont-elles chiffrées avec maîtrise locale des clés ?",
    answers: [
      { text: "Oui, clés locales ou HSM", score: 1 },
      { text: "Oui, mais clés chez un prestataire externe", score: 2 },
      { text: "Non, pas de chiffrement ou clés exposées", score: 3 },
    ],
  },
  {
    id: 6,
    question: "Êtes-vous soumis à des obligations réglementaires ou souveraines spécifiques ?",
    answers: [
      { text: "Oui, pleinement prises en compte", score: 1 },
      { text: "Oui, partiellement traitées", score: 2 },
      { text: "Oui, mais ignorées ou méconnues", score: 3 },
    ],
  },
];

export default function RiskAssessment() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
  };

  const getRiskLevel = (score: number) => {
    if (score < 7) return { level: "Faible", color: "low", icon: CheckCircle };
    if (score <= 12) return { level: "Modéré", color: "moderate", icon: AlertTriangle };
    return { level: "Élevé", color: "high", icon: AlertCircle };
  };

  const generateSynthesis = (score: number, riskLevel: string) => {
    const vulnerabilities: string[] = [];
    
    if (answers[1] === 3) vulnerabilities.push("stockage sans redondance");
    if (answers[2] >= 2) vulnerabilities.push("sauvegardes insuffisantes");
    if (answers[3] >= 2) vulnerabilities.push("absence de PRA testé");
    if (answers[4] >= 2) vulnerabilities.push("dépendance à un fournisseur unique");
    if (answers[5] >= 2) vulnerabilities.push("gestion des clés de chiffrement");
    if (answers[6] >= 2) vulnerabilities.push("conformité réglementaire");

    const intro = `Votre niveau de risque est ${riskLevel.toLowerCase()} avec un score de ${score}/18.`;
    
    const vulnText = vulnerabilities.length > 0
      ? `Les principales vulnérabilités identifiées concernent : ${vulnerabilities.slice(0, 2).join(" et ")}.`
      : "Votre infrastructure présente une bonne résilience globale.";
    
    const action = score >= 13
      ? "Nous recommandons un audit approfondi et la mise en place d'une solution de sauvegarde souveraine comme DATIS."
      : score >= 7
      ? "Un audit ciblé permettrait d'identifier les axes d'amélioration prioritaires."
      : "Votre organisation dispose d'une bonne base. Un suivi régulier est recommandé pour maintenir ce niveau.";

    return `${intro} ${vulnText} ${action}`;
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Veuillez répondre à toutes les questions");
      return;
    }
    setShowResults(true);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  const handleCopy = () => {
    const score = calculateScore();
    const risk = getRiskLevel(score);
    const synthesis = generateSynthesis(score, risk.level);
    
    const report = `Évaluation du risque de perte de données - Inspeere\n\nScore: ${score}/18\nNiveau de risque: ${risk.level}\n\n${synthesis}`;
    
    navigator.clipboard.writeText(report);
    toast.success("Rapport copié dans le presse-papier");
  };

  const handleExportPDF = () => {
    const score = calculateScore();
    const risk = getRiskLevel(score);
    const synthesis = generateSynthesis(score, risk.level);
    
    const content = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #2d5a7b; margin-bottom: 10px; }
            .header { border-bottom: 2px solid #2d5a7b; padding-bottom: 20px; margin-bottom: 30px; }
            .score { font-size: 24px; font-weight: bold; margin: 20px 0; }
            .risk { padding: 15px; border-radius: 8px; margin: 20px 0; }
            .risk-low { background: #e8f5e9; color: #2e7d32; }
            .risk-moderate { background: #fff3e0; color: #e65100; }
            .risk-high { background: #ffebee; color: #c62828; }
            .synthesis { margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Évaluation du risque de perte de données</h1>
            <p><strong>Inspeere</strong> | ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div class="score">Score: ${score}/18</div>
          <div class="risk risk-${risk.color}">
            <strong>Niveau de risque:</strong> ${risk.level}
          </div>
          <div class="synthesis">
            <h2>Synthèse</h2>
            <p>${synthesis}</p>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-risque-${new Date().getTime()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Rapport exporté");
  };

  const score = calculateScore();
  const risk = getRiskLevel(score);
  const RiskIcon = risk.icon;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Évaluation du risque de perte de données
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            Inspeere — Résilience • Souveraineté • Sobriété
          </p>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Il s'agit d'un audit express, inspiré des bonnes pratiques de cybersécurité (EBIOS, ISO 27001), conçu pour une première évaluation rapide de votre niveau de maturité face au risque de perte de données.
          </p>
        </div>

        {!showResults ? (
          <Card className="p-8">
            <div className="space-y-8">
              {questions.map((q, index) => (
                <div key={q.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        {q.question}
                      </h3>
                      <RadioGroup
                        value={answers[q.id]?.toString()}
                        onValueChange={(value) => handleAnswerChange(q.id, parseInt(value))}
                      >
                        <div className="space-y-3">
                          {q.answers.map((answer, answerIndex) => (
                            <div
                              key={answerIndex}
                              className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                            >
                              <RadioGroupItem value={answer.score.toString()} id={`q${q.id}-a${answerIndex}`} />
                              <Label
                                htmlFor={`q${q.id}-a${answerIndex}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {answer.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  {index < questions.length - 1 && (
                    <div className="border-t border-border mt-8" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                size="lg"
                disabled={Object.keys(answers).length < questions.length}
                className="px-8"
              >
                Calculer le risque
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-risk-${risk.color}-bg`}>
                  <RiskIcon className={`w-10 h-10 text-risk-${risk.color}`} />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Score: {score}/18
                  </h2>
                  <div className={`inline-block px-6 py-2 rounded-full bg-risk-${risk.color}-bg`}>
                    <span className={`text-xl font-semibold text-risk-${risk.color}`}>
                      Risque {risk.level}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full bg-risk-${risk.color} transition-all duration-500`}
                    style={{ width: `${(score / 18) * 100}%` }}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Synthèse</h3>
              <p className="text-foreground leading-relaxed">
                {generateSynthesis(score, risk.level)}
              </p>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Button onClick={handleCopy} variant="outline" className="flex-1 min-w-[200px]">
                <Copy className="w-4 h-4 mr-2" />
                Copier le rapport
              </Button>
              <Button onClick={handleExportPDF} variant="outline" className="flex-1 min-w-[200px]">
                <Download className="w-4 h-4 mr-2" />
                Exporter (HTML)
              </Button>
              <Button onClick={handleReset} className="flex-1 min-w-[200px]">
                Nouvelle évaluation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
