import { supabase } from './supabaseClient';
import type { OnlineGame, CreateGameParams, JoinGameParams, BoardState, Player } from '../types/game';

// Generiere einen 6-stelligen Game-Code
function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generiere eine eindeutige Player-ID (wird im localStorage gespeichert)
function getOrCreatePlayerId(): string {
  let playerId = localStorage.getItem('tictactoe_player_id');
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem('tictactoe_player_id', playerId);
  }
  return playerId;
}

// Erstelle ein neues Online-Spiel
export async function createGame(params: CreateGameParams): Promise<{ game: OnlineGame; gameCode: string } | { error: string }> {
  try {
    console.log('🎮 Creating game with params:', params);

    const playerId = getOrCreatePlayerId();
    console.log('👤 Player ID:', playerId);

    const gameCode = generateGameCode();
    console.log('🔑 Generated game code:', gameCode);

    const totalSquares = params.boardSize * params.boardSize;
    const emptyBoard: BoardState = Array(totalSquares).fill(null);

    console.log('📤 Inserting into Supabase...');
    const { data, error } = await supabase
      .from('games')
      .insert({
        game_code: gameCode,
        board_state: emptyBoard,
        board_size: params.boardSize,
        win_condition: params.winCondition,
        player1_id: playerId,
        player1_name: params.playerName,
        status: 'waiting',
        current_player: 'X',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { error: `Fehler beim Erstellen des Spiels: ${error.message}` };
    }

    console.log('✅ Game created successfully:', data);
    return { game: data as OnlineGame, gameCode };
  } catch (error) {
    console.error('❌ Catch block error:', error);
    return { error: 'Fehler beim Erstellen des Spiels' };
  }
}

// Tritt einem Spiel bei
export async function joinGame(params: JoinGameParams): Promise<{ game: OnlineGame } | { error: string }> {
  try {
    const playerId = getOrCreatePlayerId();

    // Finde das Spiel anhand des Codes
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select()
      .eq('game_code', params.gameCode.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (fetchError || !game) {
      return { error: 'Spiel nicht gefunden oder bereits gestartet' };
    }

    // Prüfe, ob Spieler nicht selbst der Ersteller ist
    if (game.player1_id === playerId) {
      return { error: 'Du kannst deinem eigenen Spiel nicht beitreten' };
    }

    // Update das Spiel mit player2
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        player2_id: playerId,
        player2_name: params.playerName,
        status: 'playing',
      })
      .eq('id', game.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error joining game:', updateError);
      return { error: 'Fehler beim Beitreten' };
    }

    return { game: updatedGame as OnlineGame };
  } catch (error) {
    console.error('Error joining game:', error);
    return { error: 'Fehler beim Beitreten' };
  }
}

// Hole ein Spiel anhand des Codes
export async function getGame(gameCode: string): Promise<{ game: OnlineGame } | { error: string }> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select()
      .eq('game_code', gameCode.toUpperCase())
      .single();

    if (error || !data) {
      return { error: 'Spiel nicht gefunden' };
    }

    return { game: data as OnlineGame };
  } catch (error) {
    console.error('Error fetching game:', error);
    return { error: 'Fehler beim Laden des Spiels' };
  }
}

// Mache einen Zug
export async function makeMove(
  gameId: string,
  boardState: BoardState,
  nextPlayer: Player
): Promise<{ game: OnlineGame } | { error: string }> {
  try {
    const { data, error } = await supabase
      .from('games')
      .update({
        board_state: boardState,
        current_player: nextPlayer,
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) {
      console.error('Error making move:', error);
      return { error: 'Fehler beim Zug' };
    }

    return { game: data as OnlineGame };
  } catch (error) {
    console.error('Error making move:', error);
    return { error: 'Fehler beim Zug' };
  }
}

// Beende das Spiel
export async function finishGame(
  gameId: string,
  winner: Player | null
): Promise<{ game: OnlineGame } | { error: string }> {
  try {
    const { data, error } = await supabase
      .from('games')
      .update({
        status: 'finished',
        winner,
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) {
      console.error('Error finishing game:', error);
      return { error: 'Fehler beim Beenden' };
    }

    return { game: data as OnlineGame };
  } catch (error) {
    console.error('Error finishing game:', error);
    return { error: 'Fehler beim Beenden' };
  }
}

// Subscribe zu Game-Updates (Realtime)
export function subscribeToGame(gameId: string, callback: (game: OnlineGame) => void) {
  const subscription = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        callback(payload.new as OnlineGame);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// Hole aktuelle Player-ID
export function getCurrentPlayerId(): string {
  return getOrCreatePlayerId();
}
