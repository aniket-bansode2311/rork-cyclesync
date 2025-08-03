import { Stack } from "expo-router";
import React from "react";

import { useAuth, useProtectedRoute } from "@/hooks/useAuth";
import { PeriodProvider } from "@/hooks/usePeriods";
import { SymptomProvider } from "@/hooks/useSymptoms";
import { FertilityProvider } from "@/hooks/useFertility";
import { PregnancyProvider } from "@/hooks/usePregnancy";
import { MenopauseProvider } from "@/hooks/useMenopause";
import { BirthControlProvider } from "@/components/BirthControlProvider";
import { WellnessProvider } from "@/hooks/useWellness";
import { PrivacyProvider } from "@/hooks/usePrivacy";
import { PartnerSharingProvider } from "@/hooks/usePartnerSharing";
import { EducationProvider } from "@/hooks/useEducation";
import { ForumProvider } from "@/hooks/useForum";
import { JournalProvider } from "@/hooks/useJournal";
import { HealthCoachProvider } from "@/hooks/useHealthCoach";
import { AchievementProvider } from "@/hooks/useAchievements";

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  
  // Protect all routes in this group
  useProtectedRoute(isAuthenticated);
  
  return (
    <PrivacyProvider>
      <PeriodProvider>
        <SymptomProvider>
          <FertilityProvider>
            <PregnancyProvider>
              <MenopauseProvider>
                <BirthControlProvider>
                  <WellnessProvider>
                    <PartnerSharingProvider>
                      <EducationProvider>
                        <ForumProvider>
                          <JournalProvider>
                            <HealthCoachProvider>
                              <AchievementProvider>
                                <Stack
                                  screenOptions={{
                                    headerShown: true,
                                    contentStyle: { backgroundColor: "#F9F5FF" },
                                  }}
                                />
                              </AchievementProvider>
                            </HealthCoachProvider>
                          </JournalProvider>
                        </ForumProvider>
                      </EducationProvider>
                    </PartnerSharingProvider>
                  </WellnessProvider>
                </BirthControlProvider>
              </MenopauseProvider>
            </PregnancyProvider>
          </FertilityProvider>
        </SymptomProvider>
      </PeriodProvider>
    </PrivacyProvider>
  );
}

