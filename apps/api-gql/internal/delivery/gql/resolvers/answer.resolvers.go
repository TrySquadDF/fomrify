package resolvers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	gqlmodel "github.com/TrySquadDF/formify/api-gql/internal/delivery/gql/graph/model"
	gomodel "github.com/TrySquadDF/formify/lib/gomodels"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Retrieves all form responses for a given form
func (r *queryResolver) FormResponses(ctx context.Context, formID string) ([]*gqlmodel.FormResponse, error) {
    // Check authorization
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, errors.New("authorization required")
    }

    // Check if form exists
    var form gomodel.Form
    if err := r.deps.Gorm.First(&form, "id = ?", formID).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("form not found")
        }
        return nil, err
    }

    // Check ownership
    if form.OwnerID != userID {
        return nil, errors.New("access denied")
    }

    // Get all responses
    var responses []gomodel.FormResponse
    if err := r.deps.Gorm.
        Preload("Answers").
        Preload("Answers.Question").
        Preload("Answers.SelectedOptions").
        Where("form_id = ?", formID).
        Order("created_at DESC").
        Find(&responses).Error; err != nil {
        return nil, err
    }

    // Convert models to GraphQL
    result := make([]*gqlmodel.FormResponse, 0, len(responses))
    for _, resp := range responses {
        result = append(result, FormResponseToGraphQL(&resp))
    }
    return result, nil
}

// Retrieves a single form response by ID
func (r *queryResolver) FormResponse(ctx context.Context, id string) (*gqlmodel.FormResponse, error) {
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, errors.New("authorization required")
    }

    // Get response with preloaded relations
    var response gomodel.FormResponse
    if err := r.deps.Gorm.
        Preload("Answers").
        Preload("Answers.Question").
        Preload("Answers.SelectedOptions").
        First(&response, "id = ?", id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("response not found")
        }
        return nil, err
    }

    // Get form to check ownership
    var form gomodel.Form
    if err := r.deps.Gorm.First(&form, "id = ?", response.FormID).Error; err != nil {
        return nil, err
    }
    if form.OwnerID != userID {
        return nil, errors.New("access denied")
    }

    return FormResponseToGraphQL(&response), nil
}

// Stores form response along with its answers
func (r *mutationResolver) SubmitFormResponse(ctx context.Context, input gqlmodel.FormResponseInput) (*gqlmodel.FormResponse, error) {
    log.Printf("SubmitFormResponse called for form: %s with %d answers", input.FormID, len(input.Answers))

    // Check form existence
    var form gomodel.Form
    if err := r.deps.Gorm.Preload("Questions.Options").First(&form, "id = ?", input.FormID).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("form not found")
        }
        return nil, err
    }

    // Check form access
    if form.Access == gomodel.FormAccessPrivate {
        userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
        if err != nil || userID != form.OwnerID {
            return nil, errors.New("access denied")
        }
    }

    savedAnswers := make([]gomodel.Answer, 0, len(input.Answers))
    tx := r.deps.Gorm.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            log.Printf("Panic recovered in SubmitFormResponse: %v", r)
        }
    }()

    formResponse := gomodel.FormResponse{
        ID:        uuid.New().String(),
        FormID:    input.FormID,
        CreatedAt: time.Now(),
    }

    if err := tx.Create(&formResponse).Error; err != nil {
        tx.Rollback()
        log.Printf("Error creating FormResponse: %v", err)
        return nil, err
    }

    for _, answerInput := range input.Answers {

        var question gomodel.Question
        if err := tx.First(&question, "id = ?", answerInput.QuestionID).Error; err != nil {
            tx.Rollback()
            return nil, fmt.Errorf("question not found: %s", answerInput.QuestionID)
        }

        answer := gomodel.Answer{
            ID:              uuid.New().String(),
            ResponseID:      formResponse.ID,
            QuestionID:      answerInput.QuestionID,
            Question:        question,
            SelectedOptions: make([]gomodel.Option, 0),
        }

        // Match the question type to store corresponding values
        switch question.Type {
        case "BOOLEAN": // Changed from gomodel.QuestionTypeBoolean
            if answerInput.BoolValue != nil {
                boolCopy := *answerInput.BoolValue
                answer.BoolValue = &boolCopy
            }
        case "NUMBER": // Changed from gomodel.QuestionTypeNumber
            if answerInput.NumberValue != nil {
                numCopy := *answerInput.NumberValue
                answer.NumberValue = &numCopy
            }
        case "DATE": // Changed from gomodel.QuestionTypeDate
            if answerInput.DateValue != nil {
                parsedTime, err := time.Parse(time.RFC3339, *answerInput.DateValue)
                if err != nil {
                    tx.Rollback()
                    log.Printf("Date format error: %s - %v", *answerInput.DateValue, err)
                    return nil, errors.New("invalid date format: " + *answerInput.DateValue)
                }
                answer.DateValue = &parsedTime
            }
        case "SINGLE_CHOICE", "MULTIPLE_CHOICE": // Changed from gomodel.QuestionTypeSingleChoice, etc.
            if len(answerInput.OptionIds) > 0 {
                optionsForThisAnswer := make([]gomodel.Option, 0, len(answerInput.OptionIds))
                for _, optionID := range answerInput.OptionIds {
                    var opt gomodel.Option
                    if err := tx.First(&opt, "id = ?", optionID).Error; err != nil {
                        tx.Rollback()
                        log.Printf("Option not found: %s", optionID)
                        return nil, fmt.Errorf("option not found: %s", optionID)
                    }
                    optionsForThisAnswer = append(optionsForThisAnswer, opt)

                    answerOption := gomodel.AnswerOption{
                        ID:       uuid.New().String(),
                        AnswerID: answer.ID,
                        OptionID: optionID,
                    }

                    if err := tx.Create(&answerOption).Error; err != nil {
                        tx.Rollback()
                        log.Printf("Error creating AnswerOption: %v", err)
                        return nil, err
                    }
                }
                answer.SelectedOptions = optionsForThisAnswer
            }
        case "EMAIL", "SHORT_TEXT", "PARAGRAPH", "PHONE": // Explicitly handle text types
            log.Println(answerInput)
            if answerInput.TextValue != nil {
                answer.TextValue = *answerInput.TextValue
            }
        default:
            log.Printf("Unknown question type: %s", question.Type)
            if answerInput.TextValue != nil {
                answer.TextValue = *answerInput.TextValue
            }
        }
        
        answerJSON, err := json.MarshalIndent(answer, "", "  ")
        if err != nil {
            log.Printf("Error marshaling answer to JSON: %v", err)
        } else {
            log.Printf("Saving answer: %s", string(answerJSON))
        }
        if err := tx.Create(&answer).Error; err != nil {
            tx.Rollback()
            log.Printf("Error creating Answer: %v", err)
            return nil, err
        }
        savedAnswers = append(savedAnswers, answer)
    }

    if err := tx.Commit().Error; err != nil {
        log.Printf("Transaction commit error: %v", err)
        return nil, err
    }

    var completeResponse gomodel.FormResponse
    if err := r.deps.Gorm.
        Preload("Answers").
        Preload("Answers.Question").
        Preload("Answers.SelectedOptions").
        First(&completeResponse, "id = ?", formResponse.ID).Error; err != nil {
        log.Printf("Error fetching complete response: %v", err)
        return nil, err
    }
    
    return FormResponseToGraphQL(&completeResponse), nil
}

// Convert FormResponse to GraphQL model
func FormResponseToGraphQL(fr *gomodel.FormResponse) *gqlmodel.FormResponse {
    if fr == nil {
        log.Printf("WARNING: FormResponse is nil!")
        return nil
    }

    response := &gqlmodel.FormResponse{
        ID:        fr.ID,
        FormID:    fr.FormID,
        CreatedAt: fr.CreatedAt.Format(time.RFC3339),
        Answers:   make([]*gqlmodel.Answer, 0, len(fr.Answers)),
    }

    for i := range fr.Answers {
        ans := AnswerToGraphQL(&fr.Answers[i])
        if ans != nil {
            response.Answers = append(response.Answers, ans)
        } else {
            log.Printf("WARNING: Answer at index %d is nil", i)
        }
    }
    return response
}

// Convert Answer to GraphQL model
func AnswerToGraphQL(a *gomodel.Answer) *gqlmodel.Answer {
    if a == nil {
        log.Printf("WARNING: Answer is nil in AnswerToGraphQL")
        return nil
    }

    answer := &gqlmodel.Answer{
        ID:              a.ID,
        QuestionID:      a.QuestionID,
        Question:        questionToGraphQL(&a.Question),
        SelectedOptions: make([]*gqlmodel.Option, 0),
    }

    // TextValue
    textVal := a.TextValue
    answer.TextValue = &textVal

    // BoolValue
    if a.BoolValue != nil {
        boolVal := *a.BoolValue
        answer.BoolValue = &boolVal
    }

    // NumberValue
    if a.NumberValue != nil {
        numVal := *a.NumberValue
        answer.NumberValue = &numVal
    }

    // DateValue
    if a.DateValue != nil {
        dateStr := a.DateValue.Format(time.RFC3339)
        answer.DateValue = &dateStr
    }

    // SelectedOptions with deduplication
    if len(a.SelectedOptions) > 0 {
        // Use a map to deduplicate options by ID
        optionMap := make(map[string]*gqlmodel.Option)
        for _, opt := range a.SelectedOptions {
            // Only add if not already in the map
            if _, exists := optionMap[opt.ID]; !exists {
                optionMap[opt.ID] = &gqlmodel.Option{
                    ID:   opt.ID,
                    Text: opt.Text,
                }
            }
        }
        
        // Convert map to slice
        for _, opt := range optionMap {
            answer.SelectedOptions = append(answer.SelectedOptions, opt)
        }
    }

    return answer
}