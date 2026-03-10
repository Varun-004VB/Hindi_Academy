import Hero from '../components/Hero';
import Features from '../components/Features';
import Courses from '../components/Courses';
// import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';


interface HomePageProps {
  onOpenModal: (modal: string) => void;
}

export default function HomePage({ onOpenModal }: HomePageProps) {
  return (
    <>
      <Hero onOpenModal={onOpenModal} />
      <Features />
      <Courses onOpenModal={onOpenModal} />
      {/* <HowItWorks /> */}
      <Testimonials  />
    </>
  );
}
