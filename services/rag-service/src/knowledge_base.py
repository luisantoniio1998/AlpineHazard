"""
Swiss Alpine Knowledge Base
Curated collection of Swiss mountain safety information
"""

import json
import os
import logging
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class SwissAlpineKnowledgeBase:
    """
    Swiss Alpine safety knowledge base with curated information
    """

    def __init__(self):
        self.documents = []
        self.loaded = False

    async def load_knowledge(self):
        """Load Swiss Alpine knowledge base"""
        logger.info("Loading Swiss Alpine knowledge base...")

        # Load different categories of knowledge
        await self._load_weather_safety()
        await self._load_avalanche_safety()
        await self._load_hiking_guides()
        await self._load_skiing_safety()
        await self._load_emergency_protocols()
        await self._load_equipment_guides()
        await self._load_location_specific()

        self.loaded = True
        logger.info(f"Knowledge base loaded with {len(self.documents)} documents")

    async def _load_weather_safety(self):
        """Load weather safety information"""
        weather_docs = [
            {
                "title": "Alpine Weather Dangers",
                "content": "Alpines Wetter kann sich in den Schweizer Bergen extrem schnell ändern. Temperaturschwankungen von 10-15°C innerhalb weniger Stunden sind normal. Besonders gefährlich sind: plötzliche Gewitter (besonders nachmittags), Föhnwinde mit Geschwindigkeiten über 100 km/h, und Whiteout-Bedingungen bei Nebel oder Schneesturm. Warnsignale: dunkle Wolken im Westen, plötzlicher Temperaturabfall, zunehmender Wind. Bei ersten Anzeichen sofort Schutz suchen.",
                "category": "weather",
                "location": "Swiss Alps",
                "doc_type": "safety_guide",
                "source": "Swiss Alpine Club (SAC)"
            },
            {
                "title": "Föhn Wind Safety",
                "content": "Der Föhn ist ein warmer, trockener Fallwind der in den Schweizer Alpen häufig auftritt. Gefährlich wegen: extremen Windgeschwindigkeiten (80-150 km/h), plötzlichen Richtungsänderungen, und erhöhter Lawinengefahr durch Windverfrachtung. Föhn-Warnsignale: wolkenfreie Gipfel bei bewölkten Tälern, linsenförmige Wolken, charakteristisches Heulen des Windes. Bei Föhn-Warnung: keine Hochtouren, Grate meiden, in geschützten Gebieten bleiben.",
                "category": "weather",
                "location": "Swiss Alps",
                "doc_type": "safety_guide",
                "source": "MeteoSwiss"
            },
            {
                "title": "Whiteout Survival",
                "content": "Whiteout ist eine der gefährlichsten Wetterbedingungen im Hochgebirge. Völlige Orientierungslosigkeit durch: diffuses Licht ohne Schatten, keine Horizontlinie sichtbar, alle Konturen verschwinden. Sofortige Maßnahmen: STOPP - nicht weitergehen, GPS-Position markieren, alle warme Kleidung anziehen, Windschutz errichten, Notbiwak vorbereiten. Bei Whiteout niemals: weitergehen ohne GPS, Abkürzungen nehmen, alleine handeln. Warten bis Sicht > 50m.",
                "category": "weather",
                "location": "High Alps",
                "doc_type": "emergency_protocol",
                "source": "Swiss Mountain Rescue"
            }
        ]
        self.documents.extend(weather_docs)

    async def _load_avalanche_safety(self):
        """Load avalanche safety information"""
        avalanche_docs = [
            {
                "title": "Lawinenrisiko Bewertung",
                "content": "Das Schweizer Lawinenwarnsystem verwendet 5 Gefahrenstufen: 1-Gering (grün), 2-Mäßig (gelb), 3-Erheblich (orange), 4-Groß (rot), 5-Sehr groß (schwarz). Ab Stufe 3 ist extreme Vorsicht geboten. Faktoren: Neuschnee >30cm in 24h, Wind >50km/h, Temperaturanstieg >5°C. Die meisten Lawinenunfälle passieren bei Stufe 3 'Erheblich'. Niemals bei Stufe 4-5 abseits der Pisten fahren.",
                "category": "avalanche",
                "location": "Swiss Alps",
                "doc_type": "safety_guide",
                "source": "SLF Institut"
            },
            {
                "title": "LVS Ausrüstung und Verschüttetensuche",
                "content": "Standard LVS-Ausrüstung: digitales 3-Antennen-Gerät, Sonde mind. 240cm, Lawinenschaufel mit Metallblatt. Vor jeder Tour: Funktionstest aller Geräte, Batteriestand prüfen, Reichweitentest (>50m). Suchstrategie: Signalsuche in Geradeauslauf, Grobsuche mit 10m Suchstreifenbreite, Feinsuche unter 1m Abstand, Punktortung. Zeit ist kritisch: nach 15 Minuten nur 90% Überlebenschance, nach 35 Minuten nur 30%.",
                "category": "avalanche",
                "location": "Off-piste areas",
                "doc_type": "equipment_guide",
                "source": "Swiss Alpine Club"
            },
            {
                "title": "Gefahrenmuster in den Schweizer Alpen",
                "content": "Typische Gefahrenmuster: GP1 Tiefschnee bei wenig Wind - Triebschnee in windabgewandten Hängen. GP2 Gleitschnee - ganzjährig auf steilen Grashängen. GP3 Regen bis in hohe Lagen - Durchfeuchtung der Schneedecke. GP4 Kalt auf Warm - harte Krusten als Schwachschicht. GP5 Wechten und Triebschnee nach Schneezuwachs und Wind. Besonders kritisch: Nordhänge 35-45° Neigung, windverfrachtete Bereiche, Mulden und Rinnen.",
                "category": "avalanche",
                "location": "Swiss Alps",
                "doc_type": "technical_guide",
                "source": "SLF Davos"
            }
        ]
        self.documents.extend(avalanche_docs)

    async def _load_hiking_guides(self):
        """Load hiking safety guides"""
        hiking_docs = [
            {
                "title": "Schweizer Wanderwege Klassifikation",
                "content": "Schweizer Wanderwege sind in 3 Kategorien eingeteilt: Wanderwege (gelb) - normale Kondition, feste Schuhe. Bergwanderwege (weiß-rot-weiß) - gute Kondition, Bergschuhe, Schwindelfreiheit. Alpinwanderwege (weiß-blau-weiß) - sehr gute Kondition, Klettersteig-Ausrüstung oft nötig, alpine Erfahrung erforderlich. Bei schlechtem Wetter oder Unwetterwarnung: nur gelbe Wege begehen, Bergwanderwege meiden.",
                "category": "hiking",
                "location": "Swiss Hiking Trails",
                "doc_type": "guide",
                "source": "Schweizer Wanderwege"
            },
            {
                "title": "Höhenkrankheit Prävention",
                "content": "Höhenkrankheit tritt ab 2500m auf. Symptome: Kopfschmerzen, Übelkeit, Schwindel, Schlafstörungen. Schwere Formen: Höhenhirnödem (Verwirrtheit, Koordinationsprobleme), Höhenlungenödem (Atemnot, Husten mit Schaum). Prävention: langsam aufsteigen (max. 500m Schlafhöhe/Tag ab 3000m), viel trinken, auf Körper hören. Bei Symptomen sofortiger Abstieg! Niemals höher steigen bei Höhenkrankheit.",
                "category": "hiking",
                "location": "High altitude",
                "doc_type": "medical_guide",
                "source": "Swiss Alpine Medicine"
            },
            {
                "title": "Notbiwak Techniken",
                "content": "Notbiwak bei ungeplantem Übernachten im Gebirge: Standortauswahl - windgeschützt, trocken, lawinesicher. Wärmeschutz - alle verfügbare Kleidung anziehen, Kontakt zum Boden vermeiden, zu zweit zusammenkauern. Signale - Stirnlampe, Handy, Pfeife alle 10 Min. 6x Signal = Notruf. Biwaksack oder Rettungsdecke lebenswichtig - reduziert Wärmeverlust um 80%. Bei -10°C ohne Schutz: Überlebenszeit nur 2-3 Stunden.",
                "category": "hiking",
                "location": "Alpine environment",
                "doc_type": "survival_guide",
                "source": "Swiss Mountain Rescue"
            }
        ]
        self.documents.extend(hiking_docs)

    async def _load_skiing_safety(self):
        """Load skiing safety information"""
        skiing_docs = [
            {
                "title": "FIS Pistenregeln für die Schweiz",
                "content": "Die 10 FIS-Regeln gelten auf allen Schweizer Pisten: 1. Rücksicht auf andere, 2. Geschwindigkeit und Fahrweise an Können anpassen, 3. Fahrspurwahl - der Vorausfahrende hat Vorrang, 4. Überholen mit genügend Abstand, 5. Einfahren und Anfahren nach oben blicken, 6. Anhalten nur am Pistenrand, 7. Aufstieg nur am Pistenrand, 8. Warnschilder beachten, 9. Bei Unfällen Hilfe leisten, 10. Ausweispflicht bei Unfällen. Verstöße können strafrechtlich verfolgt werden.",
                "category": "skiing",
                "location": "Swiss Ski Resorts",
                "doc_type": "rules",
                "source": "Swiss Ski Association"
            },
            {
                "title": "Off-Piste Sicherheit",
                "content": "Abseits der Pisten gelten verschärfte Sicherheitsregeln: vollständige LVS-Ausrüstung obligatorisch (LVS, Sonde, Schaufel), Lawinenbulletin studieren, niemals alleine fahren, Wetterbericht beachten. Verbotene Bereiche: gesperrte Pisten und Skirouten, Wildruhezonen (1.12.-30.4.), Lawinenschutzdämme. Bei Lawinengefahr Stufe 4-5: absolutes Off-Piste Verbot. Empfehlung: Bergführer oder Skilehrer für erste Off-Piste Erfahrungen.",
                "category": "skiing",
                "location": "Off-piste",
                "doc_type": "safety_guide",
                "source": "Swiss Ski Schools"
            }
        ]
        self.documents.extend(skiing_docs)

    async def _load_emergency_protocols(self):
        """Load emergency protocols"""
        emergency_docs = [
            {
                "title": "Alpine Notrufnummern Schweiz",
                "content": "Wichtige Notrufnummern: 1414 - Schweizer Luftrettung (REGA), 112 - Europäischer Notruf, 117 - Polizei, 118 - Feuerwehr, 144 - Sanitätsnotruf. Bei Bergunfällen: zuerst 1414 (REGA). Was angeben: genaue Position (Koordinaten), Anzahl Verletzte, Art der Verletzung, Wetterbedingungen, Landeplatz für Helikopter möglich? Handy sparen - nur für Notrufe verwenden, Position markieren für Rettung.",
                "category": "emergency",
                "location": "Switzerland",
                "doc_type": "emergency_protocol",
                "source": "REGA Swiss Air Rescue"
            },
            {
                "title": "Erste Hilfe bei Unterkühlung",
                "content": "Unterkühlung erkennen: Zittern, undeutliche Sprache, Koordinationsprobleme, Apathie. Schwere Unterkühlung: kein Zittern mehr, Bewusstlosigkeit. Erste Hilfe: aus Wind und Kälte bringen, warme trockene Kleidung, warme gezuckerte Getränke (nur bei Bewusstsein!), Körperkontakt zur Wärmung. NICHT: reiben der Haut, Alkohol, heiße Bäder. Bei Bewusstlosigkeit: stabile Seitenlage, sofort Notruf, behutsame Erwärmung, konstante Kontrolle von Atmung und Puls.",
                "category": "emergency",
                "location": "Alpine environment",
                "doc_type": "first_aid",
                "source": "Swiss Red Cross"
            },
            {
                "title": "Helikopter Rettung Signale",
                "content": "Internationale Helikopter-Signale: Y-Form mit Armen = JA, brauche Hilfe. N-Form mit Armen = NEIN, brauche keine Hilfe. Landeplatz markieren: mindestens 25x25m eben, frei von losen Gegenständen, Neigung <15°, Wind anzeigen mit Tuch/Rauch. Bei Anflug: flach hinlegen, Gesicht abwenden, lose Gegenstände sichern. Niemals von hinten oder von der Seite dem Heli nähern. Rotorbereich absolut meiden.",
                "category": "emergency",
                "location": "Alpine rescue",
                "doc_type": "rescue_protocol",
                "source": "Swiss Air Rescue"
            }
        ]
        self.documents.extend(emergency_docs)

    async def _load_equipment_guides(self):
        """Load equipment guides"""
        equipment_docs = [
            {
                "title": "Alpine Grundausrüstung Sommer",
                "content": "Sommer-Grundausrüstung für Bergtouren: wasserdichte Jacke und Hose, warme Zwischenschicht (Fleece/Daune), funktionelle Unterwäsche, Bergschuhe mit Profilsohle, Rucksack 30-40L, Erste-Hilfe-Set, Stirnlampe + Ersatzbatterien, Sonnenschutz (Brille, Creme LSF50+, Hut), Kartenmaterial/GPS, Notbiwaksack, Trillerpfeife, Handy mit Powerbank. Je nach Tour: Klettersteig-Set, Helm, Steigeisen, Pickel.",
                "category": "equipment",
                "location": "Summer Alps",
                "doc_type": "equipment_list",
                "source": "Swiss Alpine Club"
            },
            {
                "title": "Winter Sicherheitsausrüstung",
                "content": "Winter-Sicherheitsausrüstung obligatorisch: LVS-Gerät (digitaler 3-Antennen-Empfänger), Lawinensonde mindestens 240cm, Lawinenschaufel mit Metallblatt, Erste-Hilfe-Set erweitert, Biwaksack, warme Reservekleidung, Thermoskanne mit heißem Getränk, Stirnlampe + Reservebatterien, Sonnenschutz verstärkt (Schneeblindheit!). Zusätzlich je nach Aktivität: Schneeschuhe, Tourenskier mit Harscheisen, Steigeisen, Eispickel.",
                "category": "equipment",
                "location": "Winter Alps",
                "doc_type": "equipment_list",
                "source": "SLF Institut"
            }
        ]
        self.documents.extend(equipment_docs)

    async def _load_location_specific(self):
        """Load location-specific information"""
        location_docs = [
            {
                "title": "Matterhorn Sicherheit",
                "content": "Das Matterhorn (4478m) ist einer der gefährlichsten Berge der Schweizer Alpen. Hauptgefahren: Steinschlag (besonders bei Föhn), plötzliche Wetterumschwünge, überfüllte Route. Normalweg über Hörnligrat: nur für sehr erfahrene Bergsteiger, Reservierung in Hörnlihütte obligatorisch. Beste Zeit: Juli-September, Start vor 4:00 Uhr. Ausrüstung: Helm obligatorisch, Stirnlampe, Klettersteig-Set für schwierige Passagen. Umkehrpunkte definieren: spätestens 14:00 Uhr am Gipfel, bei schlechtem Wetter früher.",
                "category": "location",
                "location": "Zermatt",
                "doc_type": "mountain_guide",
                "source": "Zermatt Mountain Guides"
            },
            {
                "title": "Jungfraujoch Wetter",
                "content": "Jungfraujoch (3454m) - Top of Europe. Wetterbesonderheiten: extreme Temperaturschwankungen (-20°C bis +5°C), starke Winde bis 100 km/h, häufige Nebel- und Schneefälle auch im Sommer. UV-Strahlung durch Schnee und Höhe um 80% erhöht - Sonnenschutz obligatorisch. Gletscher-Wanderungen nur mit Bergführer, Spalten-Gefahr auch auf markierten Wegen. Bei schlechtem Wetter: nur Innenbereich besuchen, Außenbereiche meiden.",
                "category": "location",
                "location": "Jungfraujoch",
                "doc_type": "location_guide",
                "source": "Jungfrau Railways"
            },
            {
                "title": "Verbier Off-Piste Gebiete",
                "content": "Verbier Off-Piste Klassiker: Mont Fort Couloirs (nur bei stabilen Verhältnissen), Vallon d'Arby (Lawinengefahr beachten), Tortin (windverfrachtet). Besondere Gefahren: steile Nordhänge, Wechten am Mont Fort, Gletscherspalten am Mont Blanc de Cheilon. Lokale Besonderheiten: Föhn-Einfluss verstärkt Lawinengefahr, nachmittags Firn-Gefahr in Südhängen. Empfehlung: lokalen Bergführer engagieren, niemals alleine, LVS-Training vor Ort.",
                "category": "location",
                "location": "Verbier",
                "doc_type": "ski_guide",
                "source": "Verbier Ski Schools"
            }
        ]
        self.documents.extend(location_docs)

    def get_all_documents(self) -> List[Dict[str, Any]]:
        """Get all documents in the knowledge base"""
        return self.documents

    def get_document_count(self) -> int:
        """Get total number of documents"""
        return len(self.documents)

    def get_documents_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get documents by category"""
        return [doc for doc in self.documents if doc.get('category') == category]

    def get_documents_by_location(self, location: str) -> List[Dict[str, Any]]:
        """Get documents by location"""
        return [doc for doc in self.documents if location.lower() in doc.get('location', '').lower()]

    def search_documents(self, query: str) -> List[Dict[str, Any]]:
        """Simple text search in documents"""
        query_lower = query.lower()
        results = []

        for doc in self.documents:
            if (query_lower in doc.get('title', '').lower() or
                query_lower in doc.get('content', '').lower()):
                results.append(doc)

        return results