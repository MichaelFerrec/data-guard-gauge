import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, AlertTriangle, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo_inspeere.svg";

interface Question {
  id: number;
  question: string;
  answers: { text: string; score: number }[];
  coefficient: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Où sont stockées vos données critiques ?",
    coefficient: 1.5,
    answers: [
      { text: "Dans plusieurs sites ou datacenters redondés", score: 0 },
      { text: "Sur un cloud unique (AWS, OVH, etc.)", score: 1 },
      { text: "Sur un serveur local sans redondance externe", score: 2 },
    ],
  },
  {
    id: 2,
    question: "Quelle est la fréquence de vos sauvegardes ?",
    coefficient: 1.0,
    answers: [
      { text: "Quotidienne ou en continu", score: 0 },
      { text: "Hebdomadaire ou irrégulière", score: 1 },
      { text: "Moins d'une fois par semaine", score: 2 },
    ],
  },
  {
    id: 3,
    question: "Disposez-vous d'un PRA testé récemment ?",
    coefficient: 2.0,
    answers: [
      { text: "Oui, testé dans les 12 derniers mois", score: 0 },
      { text: "Oui, mais jamais testé ou partiellement", score: 1 },
      { text: "Non, aucun PRA formel", score: 2 },
    ],
  },
  {
    id: 4,
    question: "Êtes-vous dépendant d'un seul site ou fournisseur ?",
    coefficient: 1.5,
    answers: [
      { text: "Non, plusieurs sites ou fournisseurs", score: 0 },
      { text: "Oui, un seul fournisseur (cloud ou local)", score: 1 },
      { text: "Oui, un seul site physique", score: 2 },
    ],
  },
  {
    id: 5,
    question: "Vos sauvegardes sont-elles chiffrées avec maîtrise locale des clés ?",
    coefficient: 1.2,
    answers: [
      { text: "Oui, clés locales ou HSM", score: 0 },
      { text: "Oui, mais clés chez un prestataire externe", score: 1 },
      { text: "Non, pas de chiffrement ou clés exposées", score: 2 },
    ],
  },
  {
    id: 6,
    question: "Êtes-vous soumis à des obligations réglementaires ou souveraines spécifiques ?",
    coefficient: 1.2,
    answers: [
      { text: "Oui, pleinement prises en compte", score: 0 },
      { text: "Oui, partiellement traitées", score: 1 },
      { text: "Oui, mais ignorées ou méconnues", score: 2 },
    ],
  },
  {
    id: 7,
    question: "Quel est le niveau de sensibilité des données concernées ?",
    coefficient: 1.2,
    answers: [
      { text: "Données peu sensibles, à faible impact en cas de perte", score: 0 },
      { text: "Données importantes mais non réglementées", score: 1 },
      { text: "Données sensibles ou réglementées (santé, justice, RH, etc.)", score: 2 },
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
    // Calcul du score pondéré
    let weightedScore = 0;
    Object.entries(answers).forEach(([questionId, score]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question) {
        weightedScore += score * question.coefficient;
      }
    });
    return weightedScore;
  };

  const calculateMaturityRate = (weightedScore: number) => {
    // Score max = 28.8 (3 × somme des coefficients: 1.5+1.0+2.0+1.5+1.2+1.2+1.2 = 9.6)
    const maxScore = 28.8;
    const maturityRate = (1 - (weightedScore / maxScore)) * 100;
    return Math.round(maturityRate);
  };

  const getRiskLevel = (maturityRate: number) => {
    if (maturityRate >= 75) return { level: "Faible", color: "low", icon: CheckCircle };
    if (maturityRate >= 40) return { level: "Modéré", color: "moderate", icon: AlertTriangle };
    return { level: "Élevé", color: "high", icon: AlertCircle };
  };

  const recommendationsMap: Record<number, string> = {
    1: "Externaliser les sauvegardes critiques vers une infrastructure hors site, tolérante aux pannes physiques ou cyber",
    2: "Augmenter la fréquence de vos sauvegardes pour limiter la perte de données en cas d'incident",
    3: "Mettre en place un Plan de Reprise d'Activité régulièrement testé pour assurer la reprise rapide en cas de sinistre",
    4: "Diversifier les lieux ou fournisseurs de stockage pour éviter tout point unique de défaillance",
    5: "Chiffrer les sauvegardes avec des clés dont vous gardez la maîtrise (localement ou via HSM dédié)",
    6: "Mettre en conformité vos pratiques de sauvegarde avec vos obligations réglementaires",
    7: "Renforcer la protection des données sensibles avec des mesures de sécurité adaptées à leur criticité",
  };

  const getRecommendations = () => {
    const recommendations: { questionId: number; score: number; text: string }[] = [];
    
    Object.entries(answers).forEach(([questionId, score]) => {
      const id = parseInt(questionId);
      if (score >= 1 && recommendationsMap[id]) {
        recommendations.push({
          questionId: id,
          score,
          text: recommendationsMap[id],
        });
      }
    });

    // Trier par score décroissant (les plus impactantes en premier)
    return recommendations.sort((a, b) => b.score - a.score);
  };

  const generateSynthesis = (maturityRate: number, riskLevel: string) => {
    const vulnerabilities: string[] = [];
    
    if (answers[1] === 3) vulnerabilities.push("stockage sans redondance");
    if (answers[2] >= 2) vulnerabilities.push("sauvegardes insuffisantes");
    if (answers[3] >= 2) vulnerabilities.push("absence de PRA testé");
    if (answers[4] >= 2) vulnerabilities.push("dépendance à un fournisseur unique");
    if (answers[5] >= 2) vulnerabilities.push("gestion des clés de chiffrement");
    if (answers[6] >= 2) vulnerabilities.push("conformité réglementaire");
    if (answers[7] >= 2) vulnerabilities.push("sensibilité des données");

    const intro = `Votre niveau de risque est ${riskLevel.toLowerCase()} avec un taux de maturité de ${maturityRate}%.`;
    
    const vulnText = vulnerabilities.length > 0
      ? `Les principales vulnérabilités identifiées concernent : ${vulnerabilities.slice(0, 2).join(" et ")}.`
      : "Votre infrastructure présente une bonne résilience globale.";
    
    const action = maturityRate < 40
      ? "Nous recommandons un audit approfondi et la mise en place d'une solution de sauvegarde souveraine."
      : maturityRate < 75
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
    const weightedScore = calculateScore();
    const maturityRate = calculateMaturityRate(weightedScore);
    const risk = getRiskLevel(maturityRate);
    const synthesis = generateSynthesis(maturityRate, risk.level);
    
    const report = `Évaluation du risque de perte de données - Inspeere\n\nTaux de maturité: ${maturityRate}%\nNiveau de risque: ${risk.level}\n\n${synthesis}`;
    
    navigator.clipboard.writeText(report);
    toast.success("Rapport copié dans le presse-papier");
  };

  const handleExportPDF = () => {
    const weightedScore = calculateScore();
    const maturityRate = calculateMaturityRate(weightedScore);
    const risk = getRiskLevel(maturityRate);
    const synthesis = generateSynthesis(maturityRate, risk.level);
    
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
          <div class="score">Taux de maturité: ${maturityRate}%</div>
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

  const weightedScore = calculateScore();
  const maturityRate = calculateMaturityRate(weightedScore);
  const risk = getRiskLevel(maturityRate);
  const RiskIcon = risk.icon;
  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Inspeere" className="h-48" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Évaluation du risque de perte de données
          </h1>
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
            {/* Score principal avec badge de risque */}
            <Card className="p-10 animate-fade-in">
              <div className="text-center space-y-8">
                {/* Titre principal */}
                <h2 className="text-2xl font-bold text-foreground">Résultat de l'évaluation</h2>
                
                {/* Badge de taux de maturité principal */}
                <div className="flex flex-col items-center gap-6">
                  <div className={`inline-flex flex-col items-center justify-center px-12 py-8 rounded-2xl ${
                    risk.color === 'low' ? 'bg-green-100 dark:bg-green-900/30' :
                    risk.color === 'moderate' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-red-100 dark:bg-red-900/30'
                  } border-2 ${
                    risk.color === 'low' ? 'border-green-300 dark:border-green-700' :
                    risk.color === 'moderate' ? 'border-orange-300 dark:border-orange-700' :
                    'border-red-300 dark:border-red-700'
                  }`}>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-6xl font-bold ${
                        risk.color === 'low' ? 'text-green-900 dark:text-green-100' :
                        risk.color === 'moderate' ? 'text-orange-900 dark:text-orange-100' :
                        'text-red-900 dark:text-red-100'
                      }`}>{maturityRate}</span>
                      <span className={`text-2xl font-medium ${
                        risk.color === 'low' ? 'text-green-700 dark:text-green-300' :
                        risk.color === 'moderate' ? 'text-orange-700 dark:text-orange-300' :
                        'text-red-700 dark:text-red-300'
                      }`}>%</span>
                    </div>
                    <div className={`text-sm font-medium mt-1 ${
                      risk.color === 'low' ? 'text-green-700 dark:text-green-300' :
                      risk.color === 'moderate' ? 'text-orange-700 dark:text-orange-300' :
                      'text-red-700 dark:text-red-300'
                    }`}>
                      Taux de maturité
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <RiskIcon className={`w-5 h-5 ${
                        risk.color === 'low' ? 'text-green-700 dark:text-green-300' :
                        risk.color === 'moderate' ? 'text-orange-700 dark:text-orange-300' :
                        'text-red-700 dark:text-red-300'
                      }`} />
                      <span className={`text-xl font-semibold ${
                        risk.color === 'low' ? 'text-green-900 dark:text-green-100' :
                        risk.color === 'moderate' ? 'text-orange-900 dark:text-orange-100' :
                        'text-red-900 dark:text-red-100'
                      }`}>
                        Risque {risk.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Jauge avec curseur et zones clairement délimitées */}
                <div className="w-full space-y-4 pt-4">
                  {/* Labels des zones au-dessus */}
                  <div className="flex justify-between text-sm font-semibold px-1">
                    <span className="text-red-700 dark:text-red-400">Élevé (&lt;40%)</span>
                    <span className="text-orange-700 dark:text-orange-400">Modéré (40-74%)</span>
                    <span className="text-green-700 dark:text-green-400">Faible (&gt;75%)</span>
                  </div>
                  
                  {/* Barre avec curseur */}
                  <div className="relative w-full pt-10">
                    {/* Curseur positionné au-dessus de la barre */}
                    <div 
                      className="absolute -top-2 transform -translate-x-1/2 transition-all duration-700 ease-out z-10"
                      style={{ left: `${maturityRate}%` }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {/* Badge avec le taux */}
                        <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                          risk.color === 'low' ? 'bg-green-700 text-white dark:bg-green-600' :
                          risk.color === 'moderate' ? 'bg-orange-700 text-white dark:bg-orange-600' :
                          'bg-red-700 text-white dark:bg-red-600'
                        }`}>
                          {maturityRate}%
                        </div>
                        {/* Triangle pointeur */}
                        <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] ${
                          risk.color === 'low' ? 'border-t-green-700 dark:border-t-green-600' :
                          risk.color === 'moderate' ? 'border-t-orange-700 dark:border-t-orange-600' :
                          'border-t-red-700 dark:border-t-red-600'
                        }`} />
                      </div>
                    </div>
                    
                    {/* Barre de progression avec 3 zones inversées (0% = rouge, 100% = vert) */}
                    <div className="relative w-full h-10 rounded-full overflow-hidden border-2 border-border">
                      {/* Zones colorées (inversées pour refléter la maturité) */}
                      <div className="absolute inset-0 flex">
                        <div className="bg-red-200 dark:bg-red-900/50" style={{ width: '40%' }} />
                        <div className="bg-orange-200 dark:bg-orange-900/50" style={{ width: '35%' }} />
                        <div className="bg-green-200 dark:bg-green-900/50" style={{ width: '25%' }} />
                      </div>
                      
                      {/* Séparateurs verticaux aux seuils 40% et 75% */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-border" style={{ left: '40%' }} />
                      <div className="absolute top-0 bottom-0 w-0.5 bg-border" style={{ left: '75%' }} />
                    </div>
                  </div>
                  
                  {/* Échelle numérique en dessous */}
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>0%</span>
                    <span>40%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  
                  {/* Infobulle explicative */}
                  <div className="text-center mt-4">
                    <p className="text-xs text-muted-foreground italic">
                      Ce score pondéré prend en compte la criticité de chaque facteur pour évaluer la résilience de votre système face à la perte de données.
                    </p>
                  </div>
                </div>

                {/* Message explicatif contextuel */}
                <div className="max-w-2xl mx-auto">
                  <p className="text-base text-foreground leading-relaxed">
                    {risk.level === "Élevé" && "Risque élevé : votre infrastructure présente des vulnérabilités importantes. Un audit approfondi et des actions correctives sont fortement recommandés."}
                    {risk.level === "Modéré" && "Risque modéré : quelques vulnérabilités présentes. Des actions ciblées peuvent renforcer la résilience de votre infrastructure."}
                    {risk.level === "Faible" && "Risque faible : votre organisation dispose d'une bonne protection contre les pertes de données. Maintenez ces bonnes pratiques avec un suivi régulier."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Synthèse et recommandations regroupées */}
            <Card className="p-6 border-l-4 border-primary">
              {/* Synthèse de l'analyse */}
              <div className="flex gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Synthèse de l'analyse</h3>
                  <p className="text-foreground leading-relaxed">
                    {generateSynthesis(maturityRate, risk.level)}
                  </p>
                </div>
              </div>

              {/* Recommandations personnalisées */}
              {recommendations.length > 0 && (
                <>
                  <div className="border-t border-border my-6" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      🔧 Recommandations pour renforcer votre résilience
                    </h3>
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <div
                          key={rec.questionId}
                          className="flex items-start gap-3 text-foreground"
                        >
                          <span className="text-base shrink-0 mt-0.5">
                            {index === 0 ? "⚠️" : "•"}
                          </span>
                          <p className={`text-sm leading-relaxed ${index === 0 ? "font-medium" : ""}`}>
                            {rec.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Détail des réponses */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Détail de vos réponses</h3>
              <div className="space-y-3">
                {questions.map((q) => {
                  const answer = q.answers.find(a => a.score === answers[q.id]);
                  return (
                    <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-semibold text-xs shrink-0">
                        {q.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-1">{q.question}</p>
                        <p className="text-sm text-muted-foreground">{answer?.text}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold shrink-0 ${
                        answer?.score === 1 ? 'bg-risk-low-bg text-risk-low' :
                        answer?.score === 2 ? 'bg-risk-moderate-bg text-risk-moderate' :
                        'bg-risk-high-bg text-risk-high'
                      }`}>
                        {answer?.score}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Actions */}
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

            {/* Note légale */}
            <Card className="p-4 bg-muted/20 border-muted">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>NB :</strong> Cet audit express constitue une première estimation basée sur des réponses déclaratives. Il ne remplace en aucun cas une analyse de risque formelle réalisée selon une méthode reconnue comme EBIOS ou ISO 27001. Inspeere ne saurait être tenue responsable des décisions prises sur la seule base de cette évaluation préliminaire.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
