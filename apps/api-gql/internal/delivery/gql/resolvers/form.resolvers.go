package resolvers

import (
	"context"
	"errors"
	"time"

	gqlmodel "github.com/TrySquadDF/formify/api-gql/internal/delivery/gql/graph/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Database models
type Form struct {
    ID          string    `gorm:"primaryKey"`
    OwnerID     string
    Title       string
    Description *string
    Access      string
	CreatedAt   time.Time `gorm:"-"`
    UpdatedAt   time.Time `gorm:"-"` 
    Questions   []Question
}

type Question struct {
    ID        string  `gorm:"primaryKey"`
    FormID    string
    Text      string
    Type      string
    Required  bool
    Order     int
    Options   []Option
}

type Option struct {
    ID         string `gorm:"primaryKey"`
    QuestionID string
    Text       string
    Order      int
}

// Conversion helpers
func formToGraphQL(f *Form) *gqlmodel.Form {
    access := gqlmodel.FormAccess(f.Access)
    return &gqlmodel.Form{
        ID:          f.ID,
        OwnerID:     f.OwnerID,
        Title:       f.Title,
        Description: f.Description,
        Access:      access,
        CreatedAt:   f.CreatedAt.Format(time.RFC3339),
        UpdatedAt:   f.UpdatedAt.Format(time.RFC3339),
        Questions:   questionsToGraphQL(f.Questions),
    }
}

func questionsToGraphQL(questions []Question) []*gqlmodel.Question {
    result := make([]*gqlmodel.Question, len(questions))
    for i, q := range questions {
        result[i] = questionToGraphQL(&q)
    }
    return result
}

func questionToGraphQL(q *Question) *gqlmodel.Question {
    return &gqlmodel.Question{
        ID:       q.ID,
        FormID:   q.FormID,
        Text:     q.Text,
        Type:     gqlmodel.QuestionType(q.Type),
        Required: q.Required,
        Order:    int32(q.Order),
        Options:  optionsToGraphQL(q.Options),
    }
}

func optionsToGraphQL(options []Option) []*gqlmodel.Option {
    result := make([]*gqlmodel.Option, len(options))
    for i, o := range options {
        result[i] = &gqlmodel.Option{
            ID:         o.ID,
            QuestionID: o.QuestionID,
            Text:       o.Text,
            Order:      int32(o.Order),
        }
    }
    return result
}

// CreateForm is the resolver for the createForm field.
func (r *mutationResolver) CreateForm(ctx context.Context, input gqlmodel.FormInput) (*gqlmodel.Form, error) {
    // Get user ID from context
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, err
    }

    tx := r.deps.Gorm.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    form := &Form{
        ID:          uuid.New().String(),
        OwnerID:     userID,
        Title:       input.Title,
        Description: input.Description,
        Access:      string(*input.Access),
    }

    if err := tx.Create(form).Error; err != nil {
        tx.Rollback()
        return nil, err
    }

    // Create questions if provided
    if input.Questions != nil {
        for _, qInput := range input.Questions {
            question := Question{
                ID:       uuid.New().String(),
                FormID:   form.ID,
                Text:     qInput.Text,
                Type:     string(qInput.Type),
                Required: qInput.Required,
                Order:    int(qInput.Order),
            }

            if err := tx.Create(&question).Error; err != nil {
                tx.Rollback()
                return nil, err
            }

            // Create options for choice-type questions
            if qInput.Options != nil {
                for _, oInput := range qInput.Options {
                    option := Option{
                        ID:         uuid.New().String(),
                        QuestionID: question.ID,
                        Text:       oInput.Text,
                        Order:      int(oInput.Order),
                    }

                    if err := tx.Create(&option).Error; err != nil {
                        tx.Rollback()
                        return nil, err
                    }
                }
            }
        }
    }

    if err := tx.Commit().Error; err != nil {
        return nil, err
    }

    // Fetch the complete form with relations
    var result Form
    if err := r.deps.Gorm.Preload("Questions.Options").First(&result, "id = ?", form.ID).Error; err != nil {
        return nil, err
    }

    return formToGraphQL(&result), nil
}

// UpdateForm is the resolver for the updateForm field.
func (r *mutationResolver) UpdateForm(ctx context.Context, id string, input gqlmodel.FormUpdateInput) (*gqlmodel.Form, error) {
    // Get user ID for authorization
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, err
    }

    var form Form
    if err := r.deps.Gorm.First(&form, "id = ?", id).Error; err != nil {
        return nil, err
    }

    // Check ownership
    if form.OwnerID != userID {
        return nil, errors.New("not authorized to update this form")
    }

    // Begin transaction
    tx := r.deps.Gorm.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Update basic form properties
    updates := map[string]interface{}{
        "updated_at": time.Now(),
    }
    
    if input.Title != nil {
        updates["title"] = *input.Title
    }
    if input.Description != nil {
        updates["description"] = input.Description
    }
    if input.Access != nil {
        updates["access"] = string(*input.Access)
    }

    if err := tx.Model(&form).Updates(updates).Error; err != nil {
        tx.Rollback()
        return nil, err
    }

    // Handle questions if provided
    if input.Questions != nil {
        // Delete existing questions and their options
        if err := tx.Where("form_id = ?", id).Delete(&Question{}).Error; err != nil {
            tx.Rollback()
            return nil, err
        }

        // Create new questions and options
        for _, qInput := range input.Questions {
            question := Question{
                ID:       uuid.New().String(),
                FormID:   form.ID,
                Text:     qInput.Text,
                Type:     string(qInput.Type),
                Required: qInput.Required,
                Order:    int(qInput.Order),
            }

            if err := tx.Create(&question).Error; err != nil {
                tx.Rollback()
                return nil, err
            }

            // Create options for choice-type questions
            if qInput.Options != nil {
                for _, oInput := range qInput.Options {
                    option := Option{
                        ID:         uuid.New().String(),
                        QuestionID: question.ID,
                        Text:       oInput.Text,
                        Order:      int(oInput.Order),
                    }

                    if err := tx.Create(&option).Error; err != nil {
                        tx.Rollback()
                        return nil, err
                    }
                }
            }
        }
    }

    if err := tx.Commit().Error; err != nil {
        return nil, err
    }

    // Fetch updated form with all relations
    var result Form
    if err := r.deps.Gorm.Preload("Questions.Options").First(&result, "id = ?", id).Error; err != nil {
        return nil, err
    }

    return formToGraphQL(&result), nil
}

func (r *mutationResolver) DeleteForm(ctx context.Context, id string) (bool, error) {
    // Get user ID for authorization
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return false, err
    }

    // Check if form exists and user has permission
    var form Form
    if err := r.deps.Gorm.First(&form, "id = ?", id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return false, errors.New("form not found")
        }
        return false, err
    }

    if form.OwnerID != userID {
        return false, errors.New("not authorized to delete this form")
    }

    // Begin transaction
    tx := r.deps.Gorm.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // 1. Find all questions for this form
    var questions []Question
    if err := tx.Where("form_id = ?", id).Find(&questions).Error; err != nil {
        tx.Rollback()
        return false, err
    }

    // 2. Delete options for each question
    for _, q := range questions {
        if err := tx.Where("question_id = ?", q.ID).Delete(&Option{}).Error; err != nil {
            tx.Rollback()
            return false, err
        }
    }

    // 3. Delete questions
    if err := tx.Where("form_id = ?", id).Delete(&Question{}).Error; err != nil {
        tx.Rollback()
        return false, err
    }

    // 4. Finally delete the form
    if err := tx.Delete(&Form{}, "id = ?", id).Error; err != nil {
        tx.Rollback()
        return false, err
    }

    if err := tx.Commit().Error; err != nil {
        return false, err
    }

    return true, nil
}

// UpdateQuestion is the resolver for the updateQuestion field.
func (r *mutationResolver) UpdateQuestion(ctx context.Context, id string, input gqlmodel.QuestionUpdateInput) (*gqlmodel.Question, error) {
    // Get user ID for authorization
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, err
    }

    // Find question and check if user owns the related form
    var question Question
    if err := r.deps.Gorm.First(&question, "id = ?", id).Error; err != nil {
        return nil, err
    }

    // Get form to check ownership
    var form Form
    if err := r.deps.Gorm.First(&form, "id = ?", question.FormID).Error; err != nil {
        return nil, err
    }

    if form.OwnerID != userID {
        return nil, errors.New("not authorized to modify this question")
    }

    // Begin transaction
    tx := r.deps.Gorm.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Update question fields
    updates := map[string]interface{}{}
    
    if input.Text != nil {
        updates["text"] = *input.Text
    }
    if input.Type != nil {
        updates["type"] = string(*input.Type)
    }
    if input.Required != nil {
        updates["required"] = *input.Required
    }
    if input.Order != nil {
        updates["order"] = *input.Order
    }

    if len(updates) > 0 {
        if err := tx.Model(&question).Updates(updates).Error; err != nil {
            tx.Rollback()
            return nil, err
        }
    }

    // Handle options if provided
    if input.Options != nil {
        // Delete existing options
        if err := tx.Where("question_id = ?", id).Delete(&Option{}).Error; err != nil {
            tx.Rollback()
            return nil, err
        }

        // Create new options
        for _, oInput := range input.Options {
            option := Option{
                ID:         uuid.New().String(),
                QuestionID: question.ID,
                Text:       oInput.Text,
                Order:      int(oInput.Order),
            }

            if err := tx.Create(&option).Error; err != nil {
                tx.Rollback()
                return nil, err
            }
        }
    }

    if err := tx.Commit().Error; err != nil {
        return nil, err
    }

    // Fetch updated question with options
    var result Question
    if err := r.deps.Gorm.Preload("Options").First(&result, "id = ?", id).Error; err != nil {
        return nil, err
    }

    return questionToGraphQL(&result), nil
}

// DeleteQuestion is the resolver for the deleteQuestion field.
func (r *mutationResolver) DeleteQuestion(ctx context.Context, id string) (bool, error) {
    // Get user ID for authorization
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return false, err
    }

    // Find question
    var question Question
    if err := r.deps.Gorm.First(&question, "id = ?", id).Error; err != nil {
        return false, err
    }

    // Check ownership of parent form
    var form Form
    if err := r.deps.Gorm.First(&form, "id = ?", question.FormID).Error; err != nil {
        return false, err
    }

    if form.OwnerID != userID {
        return false, errors.New("not authorized to delete this question")
    }

    // Delete question (will cascade delete options if set up properly)
    if err := r.deps.Gorm.Delete(&Question{}, "id = ?", id).Error; err != nil {
        return false, err
    }

    return true, nil
}

// UpdateOption is the resolver for the updateOption field.
func (r *mutationResolver) UpdateOption(ctx context.Context, id string, input gqlmodel.OptionUpdateInput) (*gqlmodel.Option, error) {
    // Get user ID for authorization
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, err
    }

    // Find option
    var option Option
    if err := r.deps.Gorm.First(&option, "id = ?", id).Error; err != nil {
        return nil, err
    }

    // Find parent question
    var question Question
    if err := r.deps.Gorm.First(&question, "id = ?", option.QuestionID).Error; err != nil {
        return nil, err
    }

    // Find parent form to check ownership
    var form Form
    if err := r.deps.Gorm.First(&form, "id = ?", question.FormID).Error; err != nil {
        return nil, err
    }

    if form.OwnerID != userID {
        return nil, errors.New("not authorized to modify this option")
    }

    // Update option
    updates := map[string]interface{}{}
    
    if input.Text != nil {
        updates["text"] = *input.Text
    }
    if input.Order != nil {
        updates["order"] = *input.Order
    }

    if len(updates) > 0 {
        if err := r.deps.Gorm.Model(&option).Updates(updates).Error; err != nil {
            return nil, err
        }
    }

    // Reload option
    if err := r.deps.Gorm.First(&option, "id = ?", id).Error; err != nil {
        return nil, err
    }

    return &gqlmodel.Option{
        ID:         option.ID,
        QuestionID: option.QuestionID,
        Text:       option.Text,
        Order:      int32(option.Order),
    }, nil
}

// DeleteOption is the resolver for the deleteOption field.
func (r *mutationResolver) DeleteOption(ctx context.Context, id string) (bool, error) {
    // Get user ID for authorization
    userID, err := r.deps.Sessions.GetUserIDFromContext(ctx)
    if err != nil {
        return false, err
    }

    // Find option
    var option Option
    if err := r.deps.Gorm.First(&option, "id = ?", id).Error; err != nil {
        return false, err
    }

    // Check ownership through question and form
    var question Question
    if err := r.deps.Gorm.First(&question, "id = ?", option.QuestionID).Error; err != nil {
        return false, err
    }

    var form Form
    if err := r.deps.Gorm.First(&form, "id = ?", question.FormID).Error; err != nil {
        return false, err
    }

    if form.OwnerID != userID {
        return false, errors.New("not authorized to delete this option")
    }

    // Delete option
    if err := r.deps.Gorm.Delete(&Option{}, "id = ?", id).Error; err != nil {
        return false, err
    }

    return true, nil
}

// Form is the resolver for the form field.
func (r *queryResolver) Form(ctx context.Context, id string) (*gqlmodel.Form, error) {
    var form Form
    if err := r.deps.Gorm.Preload("Questions.Options").First(&form, "id = ?", id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil // GraphQL convention: return null for not found
        }
        return nil, err
    }

    return formToGraphQL(&form), nil
}

// Forms is the resolver for the forms field.
func (r *queryResolver) Forms(ctx context.Context, ownerID *string, access *gqlmodel.FormAccess) ([]*gqlmodel.Form, error) {
    query := r.deps.Gorm.Model(&Form{}).Preload("Questions.Options")

    // Apply filters
    if ownerID != nil {
        query = query.Where("owner_id = ?", *ownerID)
    }

    if access != nil {
        query = query.Where("access = ?", string(*access))
    }

    var forms []Form
    if err := query.Find(&forms).Error; err != nil {
        return nil, err
    }

    // Convert to GraphQL models
    result := make([]*gqlmodel.Form, len(forms))
    for i, form := range forms {
        result[i] = formToGraphQL(&form)
    }

    return result, nil
}