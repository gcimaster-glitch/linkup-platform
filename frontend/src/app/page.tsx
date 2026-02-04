import React from 'react';
import HeroSection from '../components/HeroSection';
import CategoryCards from '../components/CategoryCards';
import EventList from '../components/EventList';
import CampaignBanner from '../components/CampaignBanner';

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryCards />
      <EventList />
      <CampaignBanner />
    </>
  );
}
