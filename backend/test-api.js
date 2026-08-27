

async function testApi() {
  const BASE_URL = 'http://localhost:3000/api';

  console.log('1. Health Check');
  const healthRes = await fetch(`${BASE_URL}/health`);
  console.log(await healthRes.json());

  console.log('\n2. User Setup');
  const userRes = await fetch(`${BASE_URL}/users/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Child',
      persona: 'child',
      language: 'en',
    }),
  });
  const user = (await userRes.json()).data.user;
  console.log('User created:', user.id);

  console.log('\n3. Get Assessment Questions');
  const qRes = await fetch(`${BASE_URL}/assessment/${user.id}/questions`);
  const questions = (await qRes.json()).data.questions;
  console.log('Questions:', questions.length);

  console.log('\n4. Submit Assessment');
  const assessSubmitRes = await fetch(`${BASE_URL}/assessment/${user.id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      responses: questions.map(q => ({
        questionId: q.id,
        answer: q.options[0], // random guess
      }))
    }),
  });
  console.log('Assessment score:', (await assessSubmitRes.json()).data.assessment.score);

  console.log('\n5. Get Activities');
  const actRes = await fetch(`${BASE_URL}/activities`);
  const activities = (await actRes.json()).data.activities;
  console.log('Found activities:', activities.length);

  console.log('\n6. Get Activity Details');
  const actId = activities[0].id;
  const actDetailRes = await fetch(`${BASE_URL}/activities/${actId}`);
  const activityData = (await actDetailRes.json()).data.activity;
  console.log('Activity type:', activityData.type);

  console.log('\n7. Submit Attempt');
  const attemptRes = await fetch(`${BASE_URL}/attempts/${user.id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityId: actId,
      answers: activityData.content.questions.map(q => ({
        questionId: q.id,
        answer: q.correctAnswer || 'A',
        correct: true,
        attemptsUsed: 1
      }))
    })
  });
  const attemptData = await attemptRes.json();
  console.log('Attempt feedback:', attemptData.data.feedback.message);

  console.log('\n8. Get Progress');
  const progRes = await fetch(`${BASE_URL}/progress/${user.id}`);
  console.log('Progress:', (await progRes.json()).data);

  console.log('\n9. Get Dashboard');
  const dashRes = await fetch(`${BASE_URL}/dashboard/${user.id}`);
  console.log('Dashboard Level:', (await dashRes.json()).data.dashboard.currentLevel);

  console.log('\nDone!');
}

testApi().catch(console.error);
