import { Helmet } from 'react-helmet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { AssessmentForm } from '../components/AssessmentForm';
import { RecentAssessments } from '../components/RecentAssessments';
import { PlayerHistory } from '../components/PlayerHistory';
import styles from './_index.module.css';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Player Development Tracking</title>
        <meta name="description" content="Track and manage player development assessments." />
      </Helmet>
      <div className={styles.container}>
        <Tabs defaultValue="create" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="create">Create Assessment</TabsTrigger>
            <TabsTrigger value="history">Player History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <main className={styles.mainContent}>
              <div className={styles.formSection}>
                <AssessmentForm />
              </div>
              <div className={styles.assessmentsSection}>
                <RecentAssessments />
              </div>
            </main>
          </TabsContent>
          
          <TabsContent value="history">
            <main className={styles.historyContent}>
              <PlayerHistory />
            </main>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}