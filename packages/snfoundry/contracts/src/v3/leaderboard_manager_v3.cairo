use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct LeaderboardEntry {
    pub player: ContractAddress,
    pub score: u32,
    pub level: u32,
    pub timestamp: u64,
    pub session_id: u256,
}

#[starknet::interface]
pub trait ILeaderboardManager<TContractState> {
    // Core functions
    fn add_score(
        ref self: TContractState,
        player: ContractAddress,
        score: u32,
        level: u32,
        session_id: u256
    );

    // View functions
    fn get_top_scores(self: @TContractState, limit: u32) -> Array<LeaderboardEntry>;
    fn get_player_best_score(self: @TContractState, player: ContractAddress) -> LeaderboardEntry;
    fn get_player_rank(self: @TContractState, player: ContractAddress) -> u32;
    fn get_leaderboard_size(self: @TContractState) -> u32;

    // Round-based functions
    fn get_current_round(self: @TContractState) -> u32;
    fn get_round_leaderboard(self: @TContractState, round: u32, limit: u32) -> Array<LeaderboardEntry>;
    fn end_current_round(ref self: TContractState);

    // Admin functions
    fn set_max_leaderboard_size(ref self: TContractState, size: u32);
}

#[starknet::contract]
pub mod LeaderboardManager {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map,
        StorageMapReadAccess, StorageMapWriteAccess, Vec, VecTrait, MutableVecTrait
    };
    use super::LeaderboardEntry;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        game_contract: ContractAddress,

        // All-time leaderboard
        leaderboard_size: u32,
        max_leaderboard_size: u32,
        leaderboard: Map<u32, LeaderboardEntry>, // position -> entry
        player_best_position: Map<ContractAddress, u32>,

        // Round-based leaderboard
        current_round: u32,
        round_leaderboard_size: Map<u32, u32>,
        round_leaderboard: Map<(u32, u32), LeaderboardEntry>, // (round, position) -> entry
        round_player_position: Map<(u32, ContractAddress), u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ScoreAdded: ScoreAdded,
        RoundEnded: RoundEnded,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ScoreAdded {
        pub player: ContractAddress,
        pub score: u32,
        pub position: u32,
        pub round: u32,
    }

    #[derive(Drop, starknet::Event)]
    pub struct RoundEnded {
        pub round: u32,
        pub winner: ContractAddress,
        pub winning_score: u32,
        pub timestamp: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        game_contract: ContractAddress,
        max_size: u32,
    ) {
        self.owner.write(owner);
        self.game_contract.write(game_contract);
        self.max_leaderboard_size.write(max_size);
        self.current_round.write(1);
    }

    #[abi(embed_v0)]
    impl LeaderboardManagerImpl of super::ILeaderboardManager<ContractState> {
        fn add_score(
            ref self: ContractState,
            player: ContractAddress,
            score: u32,
            level: u32,
            session_id: u256
        ) {
            // Only game contract can add scores
            assert!(get_caller_address() == self.game_contract.read(), "Unauthorized");

            let timestamp = get_block_timestamp();
            let entry = LeaderboardEntry {
                player,
                score,
                level,
                timestamp,
                session_id,
            };

            // Update all-time leaderboard
            self._insert_into_leaderboard(entry);

            // Update round leaderboard
            let current_round = self.current_round.read();
            self._insert_into_round_leaderboard(current_round, entry);
        }

        fn get_top_scores(self: @ContractState, limit: u32) -> Array<LeaderboardEntry> {
            let size = self.leaderboard_size.read();
            let actual_limit = if limit > size { size } else { limit };

            let mut scores = ArrayTrait::new();
            let mut i: u32 = 0;

            while i < actual_limit {
                let entry = self.leaderboard.read(i);
                scores.append(entry);
                i += 1;
            };

            scores
        }

        fn get_player_best_score(self: @ContractState, player: ContractAddress) -> LeaderboardEntry {
            let position = self.player_best_position.read(player);
            self.leaderboard.read(position)
        }

        fn get_player_rank(self: @ContractState, player: ContractAddress) -> u32 {
            self.player_best_position.read(player)
        }

        fn get_leaderboard_size(self: @ContractState) -> u32 {
            self.leaderboard_size.read()
        }

        fn get_current_round(self: @ContractState) -> u32 {
            self.current_round.read()
        }

        fn get_round_leaderboard(
            self: @ContractState,
            round: u32,
            limit: u32
        ) -> Array<LeaderboardEntry> {
            let size = self.round_leaderboard_size.read(round);
            let actual_limit = if limit > size { size } else { limit };

            let mut scores = ArrayTrait::new();
            let mut i: u32 = 0;

            while i < actual_limit {
                let entry = self.round_leaderboard.read((round, i));
                scores.append(entry);
                i += 1;
            };

            scores
        }

        fn end_current_round(ref self: ContractState) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");

            let current_round = self.current_round.read();
            let size = self.round_leaderboard_size.read(current_round);

            if size > 0 {
                let winner_entry = self.round_leaderboard.read((current_round, 0));
                self.emit(RoundEnded {
                    round: current_round,
                    winner: winner_entry.player,
                    winning_score: winner_entry.score,
                    timestamp: get_block_timestamp(),
                });
            }

            // Start new round
            self.current_round.write(current_round + 1);
        }

        fn set_max_leaderboard_size(ref self: ContractState, size: u32) {
            assert!(get_caller_address() == self.owner.read(), "Only owner");
            self.max_leaderboard_size.write(size);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _insert_into_leaderboard(ref self: ContractState, entry: LeaderboardEntry) {
            let max_size = self.max_leaderboard_size.read();
            let mut size = self.leaderboard_size.read();

            // Find insertion position
            let mut position: u32 = 0;
            let mut found = false;

            while position < size && !found {
                let existing = self.leaderboard.read(position);
                if entry.score > existing.score {
                    found = true;
                } else {
                    position += 1;
                }
            };

            // Check if player already has a better score
            let existing_position = self.player_best_position.read(entry.player);
            if existing_position < size {
                let existing_entry = self.leaderboard.read(existing_position);
                if existing_entry.player == entry.player && existing_entry.score >= entry.score {
                    return; // Don't insert worse score
                }
            }

            // Insert entry and shift others down
            if position < max_size {
                // Shift entries down
                let mut i = if size < max_size { size } else { max_size - 1 };

                while i > position {
                    let prev_entry = self.leaderboard.read(i - 1);
                    self.leaderboard.write(i, prev_entry);

                    // Update player positions
                    if prev_entry.player != entry.player {
                        self.player_best_position.write(prev_entry.player, i);
                    }

                    i -= 1;
                };

                // Insert new entry
                self.leaderboard.write(position, entry);
                self.player_best_position.write(entry.player, position);

                // Update size
                if size < max_size {
                    self.leaderboard_size.write(size + 1);
                }

                self.emit(ScoreAdded {
                    player: entry.player,
                    score: entry.score,
                    position,
                    round: self.current_round.read(),
                });
            }
        }

        fn _insert_into_round_leaderboard(
            ref self: ContractState,
            round: u32,
            entry: LeaderboardEntry
        ) {
            let max_size = self.max_leaderboard_size.read();
            let mut size = self.round_leaderboard_size.read(round);

            // Find insertion position
            let mut position: u32 = 0;
            let mut found = false;

            while position < size && !found {
                let existing = self.round_leaderboard.read((round, position));
                if entry.score > existing.score {
                    found = true;
                } else {
                    position += 1;
                }
            };

            // Check if player already has a score this round
            let existing_position = self.round_player_position.read((round, entry.player));
            if existing_position < size {
                let existing_entry = self.round_leaderboard.read((round, existing_position));
                if existing_entry.player == entry.player && existing_entry.score >= entry.score {
                    return; // Don't insert worse score
                }
            }

            // Insert entry and shift others down
            if position < max_size {
                // Shift entries down
                let mut i = if size < max_size { size } else { max_size - 1 };

                while i > position {
                    let prev_entry = self.round_leaderboard.read((round, i - 1));
                    self.round_leaderboard.write((round, i), prev_entry);

                    // Update player positions
                    if prev_entry.player != entry.player {
                        self.round_player_position.write((round, prev_entry.player), i);
                    }

                    i -= 1;
                };

                // Insert new entry
                self.round_leaderboard.write((round, position), entry);
                self.round_player_position.write((round, entry.player), position);

                // Update size
                if size < max_size {
                    self.round_leaderboard_size.write(round, size + 1);
                }
            }
        }
    }
}
