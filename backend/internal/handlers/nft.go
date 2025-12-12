package handlers

import (
	"encoding/json"
	"net/http"
	"snake-game/backend/internal/storage"
)

type MintInfoResponse struct {
	ContractAddress string                   `json:"contract_address"`
	Price           string                   `json:"price"` // в wei (для прикладу "1000000000000000")
	AvailableSkins  []string                 `json:"available_skins"`
	ABI             []map[string]interface{} `json:"abi"`
}

func SaveWallet(store storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			PlayerID string `json:"player_id"`
			Wallet   string `json:"wallet"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		store.SaveUserWallet(req.PlayerID, req.Wallet)
		w.WriteHeader(http.StatusOK)
	}
}

func GetPlayerSkins(store storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		playerID := r.URL.Query().Get("player_id")
		skins := store.GetPlayerNFTs(playerID)
		json.NewEncoder(w).Encode(skins)
	}
}

func HandleNFTMint(store *storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			PlayerID string `json:"player_id"`
			Wallet   string `json:"wallet"`
			Skin     string `json:"skin"`
			TxHash   string `json:"tx_hash"` // якщо фронт отримує tx після мінту
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		if req.PlayerID == "" || req.Skin == "" {
			http.Error(w, "missing player_id or skin", http.StatusBadRequest)
			return
		}

		if err := store.SaveMintedSkin(req.PlayerID, req.Skin, req.TxHash); err != nil {
			http.Error(w, "failed to save mint", http.StatusInternalServerError)
			return
		}

		if req.Wallet != "" {
			store.SaveUserWallet(req.PlayerID, req.Wallet)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "mint_success",
			"message": "Skin minted and saved!",
		})
	}
}

func GetMintInfo(w http.ResponseWriter, r *http.Request) {
	info := MintInfoResponse{
		ContractAddress: "0xYourDeployedContractOnPolygonOrSepolia", // ← заміниТи після деплою
		Price:           "1000000000000000",                         // 0.001 ETH
		AvailableSkins:  []string{"default", "legendary-golden-2025", "rainbow", "fire", "ice"},
		ABI: []map[string]interface{}{
			{
				"inputs": []map[string]interface{}{
					{"internalType": "address", "name": "to", "type": "address"},
					{"internalType": "string", "name": "_skinType", "type": "string"},
				},
				"name":            "mintSkin",
				"outputs":         []interface{}{},
				"stateMutability": "payable",
				"type":            "function",
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(info)
}
