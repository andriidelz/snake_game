package handlers

type SaveScoreRequest struct {
	PlayerID string `json:"player_id" validate:"required,alphanum,min=3,max=32"`
	Score    int    `json:"score" validate:"required,gte=0,lte=999999"`
	Length   int    `json:"length" validate:"required,gte=3"`
	Skin     string `json:"skin,omitempty" validate:"omitempty,hexcolor"`
}

type MintNFTRequest struct {
	Wallet   string `json:"wallet" validate:"required,eth_addr"`
	SkinType string `json:"skin_type" validate:"required,oneof=default legendary rainbow fire"`
}
