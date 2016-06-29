package tokens

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
)

const (
	findUAAToken = `SELECT auth_token, refresh_token, token_expiry
                  FROM tokens
                  WHERE token_type = 'uaa' AND user_guid = $1`

	countUAATokens = `SELECT COUNT(*)
                    FROM tokens
                    WHERE token_type = 'uaa' AND user_guid = $1`

	insertUAAToken = `INSERT INTO tokens (user_guid, token_type, auth_token, refresh_token, token_expiry)
	                  VALUES ($1, $2, $3, $4, $5)`

	updateUAAToken = `UPDATE tokens
	                  SET auth_token = $3, refresh_token = $4, token_expiry = $5
	                  WHERE user_guid = $1 AND token_type = $2`

	findCNSIToken = `SELECT auth_token, refresh_token, token_expiry
                   FROM tokens
                   WHERE cnsi_guid=$1 AND user_guid = $2 AND token_type = 'cnsi'`

	countCNSITokens = `SELECT COUNT(*)
                   FROM tokens
                   WHERE cnsi_guid=$1 AND user_guid = $2 AND token_type = 'cnsi'`

	insertCNSIToken = `INSERT INTO tokens (cnsi_guid, user_guid, token_type, auth_token, refresh_token, token_expiry)
	                   VALUES ($1, $2, $3, $4, $5, $6)`

	updateCNSIToken = `UPDATE tokens
	                   SET auth_token = $4, refresh_token = $5, token_expiry = $6
	                   WHERE cnsi_guid = $1 AND user_guid = $2 AND token_type = $3`

	deleteCNSIToken = `DELETE FROM tokens
                     WHERE token_type = 'cnsi' AND cnsi_guid = $1 AND user_guid = $2`
)

// TODO (wchrisjohnson) We need to adjust several calls ^ to accept a list of items (guids) as input

// PgsqlTokenRepository is a PostgreSQL-backed token repository
type PgsqlTokenRepository struct {
	db *sql.DB
}

// NewPgsqlTokenRepository - get a reference to the token data source
func NewPgsqlTokenRepository(dcp *sql.DB) (Repository, error) {
	return &PgsqlTokenRepository{db: dcp}, nil
}

// SaveUAAToken - Save the UAA token to the datastore
func (p *PgsqlTokenRepository) SaveUAAToken(userGUID string, tr TokenRecord, encryptionKey []byte) error {

	if userGUID == "" {
		msg := "Unable to save UAA Token without a valid User GUID."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	if tr.AuthToken == "" {
		msg := "Unable to save UAA Token without a valid Auth Token."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	if tr.RefreshToken == "" {
		msg := "Unable to save UAA Token without a valid Refresh Token."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	// Is there an existing token?
	var count int
	err := p.db.QueryRow(countUAATokens, userGUID).Scan(&count)
	if err != nil {
		log.Printf("Unknown error attempting to find UAA token: %v", err)
	}

	switch count {
	case 0:
		log.Println("Existing UAA token not found - attempting insert.")

		log.Println("Encrypting Auth Token before INSERT.")
		ciphertextAuthToken, encryptErr := encryptToken(encryptionKey, tr.AuthToken)
		if encryptErr != nil {
			return encryptErr
		}

		log.Println("Encrypting Refresh Token before INSERT.")
		ciphertextRefreshToken, encryptErr := encryptToken(encryptionKey, tr.RefreshToken)
		if encryptErr != nil {
			return encryptErr
		}

		if _, insertErr := p.db.Exec(insertUAAToken, userGUID, "uaa",
			ciphertextAuthToken, ciphertextRefreshToken,
			tr.TokenExpiry); insertErr != nil {
			msg := "Unable to INSERT UAA token: %v"
			log.Printf(msg, insertErr)
			return fmt.Errorf(msg, insertErr)
		}

		log.Println("UAA token INSERT complete.")

	default:
		log.Println("Existing UAA token found - attempting update.")

		log.Println("Encrypting Auth Token before UPDATE.")
		ciphertextAuthToken, encryptErr := encryptToken(encryptionKey, tr.AuthToken)
		if encryptErr != nil {
			return encryptErr
		}

		log.Println("Encrypting Refresh Token before UPDATE.")
		ciphertextRefreshToken, encryptErr := encryptToken(encryptionKey, tr.RefreshToken)
		if encryptErr != nil {
			return encryptErr
		}

		// Found a match - update it
		if _, updateErr := p.db.Exec(updateUAAToken, userGUID, "uaa",
			ciphertextAuthToken, ciphertextRefreshToken,
			tr.TokenExpiry); updateErr != nil {
			msg := "Unable to UPDATE UAA token: %v"
			log.Printf(msg, updateErr)
			return fmt.Errorf(msg, updateErr)
		}

		log.Println("UAA token UPDATE complete.")
	}

	return nil
}

// FindUAAToken - return the UAA token from the datastore
func (p *PgsqlTokenRepository) FindUAAToken(userGUID string, encryptionKey []byte) (TokenRecord, error) {

	if userGUID == "" {
		msg := "Unable to find UAA Token without a valid User GUID."
		log.Printf(msg)
		return TokenRecord{}, fmt.Errorf(msg)
	}

	// temp vars to retrieve db data
	var (
		ciphertextAuthToken    string
		ciphertextRefreshToken string
		tokenExpiry            int64
	)

	// Get the UAA record from the db
	err := p.db.QueryRow(findUAAToken, userGUID).Scan(&ciphertextAuthToken, &ciphertextRefreshToken, &tokenExpiry)
	if err != nil {
		msg := "Unable to Find UAA token: %v"
		log.Printf(msg, err)
		return TokenRecord{}, fmt.Errorf(msg, err)
	}

	log.Println("Decrypting Auth Token.")
	plaintextAuthToken, decryptErr := decryptToken(encryptionKey, ciphertextAuthToken)
	if decryptErr != nil {
		return TokenRecord{}, decryptErr
	}

	log.Println("Decrypting Refresh Token.")
	plaintextRefreshToken, decryptErr := decryptToken(encryptionKey, ciphertextRefreshToken)
	if decryptErr != nil {
		return TokenRecord{}, decryptErr
	}

	// Build a new TokenRecord based on the decrypted tokens
	tr := new(TokenRecord)
	tr.AuthToken = plaintextAuthToken
	tr.RefreshToken = plaintextRefreshToken
	tr.TokenExpiry = tokenExpiry

	return *tr, nil
}

// SaveCNSIToken - Save the CNSI (UAA) token to the datastore
func (p *PgsqlTokenRepository) SaveCNSIToken(cnsiGUID string, userGUID string, tr TokenRecord, encryptionKey []byte) error {

	if cnsiGUID == "" {
		msg := "Unable to save CNSI Token without a valid CNSI GUID."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	if userGUID == "" {
		msg := "Unable to save CNSI Token without a valid User GUID."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	if tr.AuthToken == "" {
		msg := "Unable to save CNSI Token without a valid Auth Token."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	if tr.RefreshToken == "" {
		msg := "Unable to save CNSI Token without a valid Refresh Token."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	// Is there an existing token?
	var count int
	err := p.db.QueryRow(countCNSITokens, cnsiGUID, userGUID).Scan(&count)
	if err != nil {
		log.Printf("Unknown error attempting to find CNSI token: %v", err)
	}

	switch count {
	case 0:
		log.Println("Existing CNSI token not found - attempting insert.")

		log.Println("Encrypting Auth Token before INSERT.")
		ciphertextAuthToken, encryptErr := encryptToken(encryptionKey, tr.AuthToken)
		if encryptErr != nil {
			return encryptErr
		}

		log.Println("Encrypting Refresh Token before INSERT.")
		ciphertextRefreshToken, encryptErr := encryptToken(encryptionKey, tr.RefreshToken)
		if encryptErr != nil {
			return encryptErr
		}

		if _, insertErr := p.db.Exec(insertCNSIToken, cnsiGUID, userGUID, "cnsi", ciphertextAuthToken,
			ciphertextRefreshToken, tr.TokenExpiry); insertErr != nil {
			msg := "Unable to INSERT CNSI token: %v"
			log.Printf(msg, insertErr)
			return fmt.Errorf(msg, insertErr)
		}

		log.Println("CNSI token INSERT complete.")
	default:
		log.Println("Existing CNSI token found - attempting update.")

		log.Println("Encrypting Auth Token before UPDATE.")
		ciphertextAuthToken, encryptErr := encryptToken(encryptionKey, tr.AuthToken)
		if encryptErr != nil {
			return encryptErr
		}

		log.Println("Encrypting Refresh Token before UPDATE.")
		ciphertextRefreshToken, encryptErr := encryptToken(encryptionKey, tr.RefreshToken)
		if encryptErr != nil {
			return encryptErr
		}

		if _, updateErr := p.db.Exec(updateCNSIToken, cnsiGUID, userGUID, "cnsi", ciphertextAuthToken,
			ciphertextRefreshToken, tr.TokenExpiry); updateErr != nil {
			msg := "Unable to UPDATE CNSI token: %v"
			log.Printf(msg, updateErr)
			return fmt.Errorf(msg, updateErr)
		}

		log.Println("CNSI token UPDATE complete.")
	}

	return nil
}

// FindCNSIToken - retrieve a CNSI (UAA) token from the datastore
func (p *PgsqlTokenRepository) FindCNSIToken(cnsiGUID string, userGUID string, encryptionKey []byte) (TokenRecord, error) {

	if cnsiGUID == "" {
		msg := "Unable to find CNSI Token without a valid CNSI GUID."
		log.Println(msg)
		return TokenRecord{}, fmt.Errorf(msg)
	}

	if userGUID == "" {
		msg := "Unable to find CNSI Token without a valid User GUID."
		log.Println(msg)
		return TokenRecord{}, fmt.Errorf(msg)
	}

	// temp vars to retrieve db data
	var (
		ciphertextAuthToken    string
		ciphertextRefreshToken string
		tokenExpiry            int64
	)

	err := p.db.QueryRow(findCNSIToken, cnsiGUID, userGUID).Scan(&ciphertextAuthToken, &ciphertextRefreshToken, &tokenExpiry)
	if err != nil {
		msg := "Unable to Find CNSI token: %v"
		log.Printf(msg, err)
		return TokenRecord{}, fmt.Errorf(msg, err)
	}

	log.Println("Decrypting Auth Token.")
	plaintextAuthToken, decryptErr := decryptToken(encryptionKey, ciphertextAuthToken)
	if decryptErr != nil {
		return TokenRecord{}, decryptErr
	}

	log.Println("Decrypting Refresh Token.")
	plaintextRefreshToken, decryptErr := decryptToken(encryptionKey, ciphertextRefreshToken)
	if decryptErr != nil {
		return TokenRecord{}, decryptErr
	}

	// Build a new TokenRecord based on the decrypted tokens
	tr := new(TokenRecord)
	tr.AuthToken = plaintextAuthToken
	tr.RefreshToken = plaintextRefreshToken
	tr.TokenExpiry = tokenExpiry

	return *tr, nil
}

// DeleteCNSIToken - remove a CNSI token (disconnect from a given CNSI)
func (p *PgsqlTokenRepository) DeleteCNSIToken(cnsiGUID string, userGUID string) error {

	if cnsiGUID == "" {
		msg := "Unable to delete CNSI Token without a valid CNSI GUID."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	if userGUID == "" {
		msg := "Unable to delete CNSI Token without a valid User GUID."
		log.Println(msg)
		return fmt.Errorf(msg)
	}

	_, err := p.db.Exec(deleteCNSIToken, cnsiGUID, userGUID)
	if err != nil {
		msg := "Unable to Delete CNSI token: %v"
		log.Printf(msg, err)
		return fmt.Errorf(msg, err)
	}

	return nil
}

// encryptToken - TBD
func encryptToken(key []byte, t string) (string, error) {
	log.Println("===== encryptToken =")
	log.Println("Token about to be encrypted.")
	log.Println(t)

	var plaintextToken = []byte(t)
	ciphertextToken, encryptErr := encrypt(key, plaintextToken)
	if encryptErr != nil {
		msg := "Unable to encrypt token: %v"
		log.Printf(msg, encryptErr)
		return "", fmt.Errorf(msg, encryptErr)
	}

	log.Println("Token encrypted:")
	log.Println(ciphertextToken)

	// Note:
	// When it's time to store the encrypted token in PostgreSQL, it's gets a bit
	// hairy. The encrypted token is binary data, not really text data, which
	// typically has a character set, unlike binary data. Generally speaking, it
	// comes down to one of two choices: store it in a bytea column, and deal with
	// some funkiness; or store it in a text column and make sure to base64 encode
	// it going in and decode it coming out.
	// https://wiki.postgresql.org/wiki/BinaryFilesInDB
	// http://engineering.pivotal.io/post/ByteA_versus_TEXT_in_PostgreSQL/
	// I chose option 2.

	token := base64.StdEncoding.EncodeToString(ciphertextToken)
	log.Println("Token base64 encoded")
	log.Println(token)
	return token, nil
}

// decryptToken - TBD
func decryptToken(key []byte, t string) (string, error) {
	log.Println("===== decryptToken =")
	log.Println("Attempting decrypt of token:")
	log.Println(t)

	// Note:
	// When it's time to store the encrypted token in PostgreSQL, it's gets a bit
	// hairy. The encrypted token is binary data, not really text data, which
	// typically has a character set, unlike binary data. Generally speaking, it
	// comes down to one of two choices: store it in a bytea column, and deal with
	// some funkiness; or store it in a text column and make sure to base64 encode
	// it going in and decode it coming out.
	// https://wiki.postgresql.org/wiki/BinaryFilesInDB
	// http://engineering.pivotal.io/post/ByteA_versus_TEXT_in_PostgreSQL/
	// I chose option 2.

	strCipherTextToken, err := base64.StdEncoding.DecodeString(t)
	if err != nil {
		msg := "Unable to decode token: %v"
		log.Printf(msg, err)
		return "", fmt.Errorf(msg, err)
	}
	log.Println("Token base64 decoded.")
	log.Println(strCipherTextToken)

	var ciphertextToken = []byte(strCipherTextToken)
	plaintextToken, decryptErr := decrypt(key, ciphertextToken)
	if decryptErr != nil {
		msg := "Unable to decrypt token: %v"
		log.Printf(msg, decryptErr)
		return "", fmt.Errorf(msg, decryptErr)
	}
	log.Println("Token decrypted.")
	log.Println(string(plaintextToken))

	return string(plaintextToken), nil
}
