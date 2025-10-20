/**
 * Управление сессиями диалога
 */

const sessions = new Map();

export function createSession(sessionId) {
  sessions.set(sessionId, {
    id: sessionId,
    conversationHistory: [],
    createdAt: Date.now()
  });
  console.log(`📝 Создана сессия: ${sessionId}`);
  return sessions.get(sessionId);
}

export function getSession(sessionId) {
  return sessions.get(sessionId);
}

export function addMessage(sessionId, role, text) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  session.conversationHistory.push({ role, text });

  // Ограничиваем историю последними 10 сообщениями
  if (session.conversationHistory.length > 10) {
    session.conversationHistory.splice(0, session.conversationHistory.length - 10);
  }

  return session;
}

export function getConversationHistory(sessionId) {
  const session = sessions.get(sessionId);
  return session ? session.conversationHistory : [];
}

export function deleteSession(sessionId) {
  console.log(`🗑️ Удалена сессия: ${sessionId}`);
  sessions.delete(sessionId);
}

// Очистка старых сессий (старше 1 часа)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > oneHour) {
      deleteSession(sessionId);
    }
  }
}, 30 * 60 * 1000); // Проверка каждые 30 минут
