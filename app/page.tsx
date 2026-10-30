import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import AboutSection from "@/app/components/AboutSection";
import ExperienceSection from "@/app/components/ExperienceSection";
import ProjectsSection from "@/app/components/ProjectsSection";
import SkillsSection from "@/app/components/SkillsSection";
import AchievementsSection from "@/app/components/AchievementsSection";
import EducationSection from "@/app/components/EducationSection";
import ContactSection from "@/app/components/ContactSection";
import Chatbot from "@/app/components/Chatbot/Chatbot";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <AchievementsSection />
        <EducationSection />
        <ContactSection />
      </main>
      <Chatbot />
    </>
  );
}


