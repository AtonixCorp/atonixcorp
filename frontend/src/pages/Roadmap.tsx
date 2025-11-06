import React, { useMemo, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  Flag,
  Public,
  Bolt,
  Payment,
  Security,
  RocketLaunch,
  School,
  Science,
  Print,
  PictureAsPdf,
  Language,
} from '@mui/icons-material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'AtonixCorp Vision & Strategic Roadmap',
    subtitle: 'A sovereign, community-driven technology platform for Africa and the world.',
    introduction: 'Introduction',
    philosophy: 'Foundational Philosophy',
    divisions: 'Core Divisions & Strategic Projects',
    education: 'Education & Talent Development',
    leadership: 'Leadership, Governance & Legacy',
    roadmap: 'Roadmap to 2030',
    gratitude: 'Gratitude & Call to Action',
    getInvolved: 'Get Involved',
    seeProjects: 'See Projects',
    founder: 'Founder: Samuel Obiora — Founder & Technical Architect, AtonixCorp',
    print: 'Print / Save as PDF',
    exportPdf: 'Export PDF',
  },
  fr: {
    title: "Vision et Feuille de Route Stratégique d'AtonixCorp",
    subtitle: 'Une plateforme souveraine et communautaire pour l\'Afrique et le monde.',
    introduction: 'Introduction',
    philosophy: 'Philosophie Fondamentale',
    divisions: 'Divisions Clés & Projets Stratégiques',
    education: 'Éducation et Développement des Talents',
    leadership: 'Leadership, Gouvernance & Héritage',
    roadmap: 'Feuille de Route jusqu\'à 2030',
    gratitude: 'Gratitude & Appel à l\'Action',
    getInvolved: 'Participer',
    seeProjects: 'Voir les Projets',
    founder: "Fondateur: Samuel Obiora — Fondateur & Architecte Technique, AtonixCorp",
    print: 'Imprimer / Enregistrer en PDF',
    exportPdf: 'Exporter en PDF',
  },
};

const SectionPaper: React.FC<{ id: string; title: string; icon?: React.ReactNode; children?: React.ReactNode }> = ({ id, title, icon, children }) => (
  <Paper id={id} sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }} elevation={1}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ color: 'text.secondary' }}>{children}</Box>
  </Paper>
);

const Roadmap: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const t = useMemo(() => translations[lang], [lang]);
  const sections = useMemo(() => [
    { id: 'introduction', label: t.introduction },
    { id: 'philosophy', label: t.philosophy },
    { id: 'divisions', label: t.divisions },
    { id: 'education', label: t.education },
    { id: 'leadership', label: t.leadership },
    { id: 'roadmap', label: t.roadmap },
    { id: 'gratitude', label: t.gratitude },
  ], [t]);

  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    // simple print via browser print dialog which can Save as PDF
    window.print();
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box sx={{ py: 4, background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>{t.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary">{t.subtitle}</Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="lang-select-label"><Language fontSize="small" sx={{ mr: 1 }} />Lang</InputLabel>
              <Select
                labelId="lang-select-label"
                value={lang}
                label="Lang"
                onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
              </Select>
            </FormControl>

            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>{t.print}</Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <Box>
            <div ref={printRef}>
              <SectionPaper id="introduction" title={t.introduction} icon={<Public color="primary" />}>
                <Typography paragraph>
                  AtonixCorp is a sovereign technology company founded with the mission to empower Africa and contribute meaningfully to humanity through infrastructure, education, and innovation. Our vision is rooted in independence, modularity, and legacy — building platforms that outlast any single leader and uplift entire communities.
                </Typography>
              </SectionPaper>

              <SectionPaper id="philosophy" title={t.philosophy} icon={<Flag color="secondary" />}>
                <Typography paragraph>
                  Born from a desire to transform adversity into opportunity, AtonixCorp believes technology should be sovereign, inclusive, and regenerative. We prioritize modular infrastructure, education, and community-led growth.
                </Typography>
                <Typography component="ul" sx={{ pl: 3 }}>
                  <li>No one can do everything for you — but the right advice can change your life.</li>
                  <li>Infrastructure must be modular, scalable, and community-driven.</li>
                  <li>Education is the cornerstone of sustainable development.</li>
                  <li>Africa must be positioned as a global leader in technology and space research.</li>
                </Typography>
              </SectionPaper>

              <SectionPaper id="divisions" title={t.divisions} icon={<Bolt color="warning" />}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Cloud Computing & Data Sovereignty</Typography>
                    <Typography color="text.secondary">Data centers in Swaziland and Cape Town. Construction begins 2026, deploy 2027.</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Voltoraiq — Solar Energy</Typography>
                    <Typography color="text.secondary">200-acre solar farm, target 170–200kW daily; regional energy resilience.</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>TujengePay — Fintech</Typography>
                    <Typography color="text.secondary">Unified payments across Africa: mobile payments, P2P, airtime, utility recharge, crypto-native.</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Osrovnet — Cybersecurity</Typography>
                    <Typography color="text.secondary">Threat intelligence, resilience, and infrastructure security for governments and enterprises.</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Planivar — Space Research</Typography>
                    <Typography color="text.secondary">Partner with international agencies, launch African rocket, build open-source astrophysics tools.</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Quantum Computing</Typography>
                    <Typography color="text.secondary">Research in quantum cryptography, atomic computation, and complex system simulation.</Typography>
                  </Box>
                </Box>
              </SectionPaper>

              <SectionPaper id="education" title={t.education} icon={<School color="success" />}>
                <Typography paragraph>
                  The School of Technology trains future innovators with hands-on curriculum across cloud, cybersecurity, and space research. Graduates will lead Africa’s tech renaissance.
                </Typography>
              </SectionPaper>

              <SectionPaper id="leadership" title={t.leadership} icon={<Security color="error" />}>
                <Typography paragraph>
                  AtonixCorp is structured to ensure continuity beyond its founder via shared ownership, succession planning, and community engagement. We build systems that anyone can lead.
                </Typography>
              </SectionPaper>

              <SectionPaper id="roadmap" title={t.roadmap} icon={<RocketLaunch color="primary" />}>
                <Timeline position="alternate">
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">2026</TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="primary">
                        <Flag />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography sx={{ fontWeight: 700 }}>Begin construction of Swaziland and Cape Town data centers</Typography>
                    </TimelineContent>
                  </TimelineItem>

                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">2027</TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="success">
                        <Payment />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography sx={{ fontWeight: 700 }}>Launch AtonixCorp to market; deploy TujengePay across Africa</Typography>
                    </TimelineContent>
                  </TimelineItem>

                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">2028</TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="warning">
                        <Bolt />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography sx={{ fontWeight: 700 }}>Operationalize Voltoraiq solar farm; expand cybersecurity services</Typography>
                    </TimelineContent>
                  </TimelineItem>

                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">2029</TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="error">
                        <RocketLaunch />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography sx={{ fontWeight: 700 }}>Launch Planivar rocket; publish quantum computing research</Typography>
                    </TimelineContent>
                  </TimelineItem>

                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">2030</TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="secondary">
                        <Science />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography sx={{ fontWeight: 700 }}>Graduate first School of Technology cohort; expand globally</Typography>
                    </TimelineContent>
                  </TimelineItem>
                </Timeline>
              </SectionPaper>

              <SectionPaper id="gratitude" title={t.gratitude} icon={<Public color="secondary" />}>
                <Typography paragraph>
                  Special thanks to mentors, family, and early supporters. Join us in building sovereign infrastructure and education that lasts generations.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" color="primary" href="/contact">{t.getInvolved}</Button>
                  <Button variant="outlined" color="primary" href="/projects">{t.seeProjects}</Button>
                </Box>
              </SectionPaper>

              <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="caption">{t.founder}</Typography>
              </Box>
            </div>
          </Box>

          <Box>
            <Paper sx={{ position: { md: 'sticky' }, top: 100, p: 2, borderRadius: 2 }} elevation={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>On this page</Typography>
              <List>
                {sections.map((s) => (
                  <ListItemButton key={s.id} onClick={() => scrollTo(s.id)}>
                    <ListItemText primary={s.label} />
                  </ListItemButton>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Export</Typography>
              <Button startIcon={<Print />} fullWidth variant="outlined" onClick={handlePrint} sx={{ mb: 1 }}>Print / Save as PDF</Button>
              <Button startIcon={<PictureAsPdf />} fullWidth variant="contained" onClick={handlePrint}>{t.exportPdf}</Button>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Roadmap;
