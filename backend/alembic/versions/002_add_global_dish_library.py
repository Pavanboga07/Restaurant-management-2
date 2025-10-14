"""add global dish library and fuzzy search

Revision ID: 002
Revises: 001
Create Date: 2025-10-13 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    """
    Upgrade: Add Global Dish Library tables with fuzzy search support
    """
    
    # Enable pg_trgm extension for fuzzy text search
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
    
    # Create global_dishes table
    op.create_table(
        'global_dishes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('cuisine', sa.String(length=100), nullable=True),
        sa.Column('default_price', sa.Float(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('is_vegetarian', sa.Boolean(), nullable=True, default=False),
        sa.Column('spice_level', sa.Integer(), nullable=True, default=0),
        sa.Column('prep_time_minutes', sa.Integer(), nullable=True, default=15),
        sa.Column('calories', sa.Integer(), nullable=True),
        sa.Column('allergens', sa.JSON(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('popularity_score', sa.Float(), nullable=True, default=0.0),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_global_dishes_id'), 'global_dishes', ['id'], unique=False)
    op.create_index(op.f('ix_global_dishes_name'), 'global_dishes', ['name'], unique=False)
    op.create_index(op.f('ix_global_dishes_category'), 'global_dishes', ['category'], unique=False)
    op.create_index(op.f('ix_global_dishes_cuisine'), 'global_dishes', ['cuisine'], unique=False)
    
    # Create trigram index for fuzzy search on dish names
    op.execute('CREATE INDEX idx_global_dishes_name_trgm ON global_dishes USING GIN (name gin_trgm_ops);')
    
    # Create global_ingredients table
    op.create_table(
        'global_ingredients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('standard_unit', sa.String(length=50), nullable=False),
        sa.Column('alternate_names', sa.JSON(), nullable=True),
        sa.Column('avg_cost_per_unit', sa.Float(), nullable=True, default=0.0),
        sa.Column('is_perishable', sa.Boolean(), nullable=True, default=False),
        sa.Column('avg_shelf_life_days', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_global_ingredients_id'), 'global_ingredients', ['id'], unique=False)
    op.create_index(op.f('ix_global_ingredients_name'), 'global_ingredients', ['name'], unique=True)
    op.create_index(op.f('ix_global_ingredients_category'), 'global_ingredients', ['category'], unique=False)
    
    # Create trigram index for fuzzy search on ingredient names
    op.execute('CREATE INDEX idx_global_ingredients_name_trgm ON global_ingredients USING GIN (name gin_trgm_ops);')
    
    # Create global_dish_ingredients table (mapping)
    op.create_table(
        'global_dish_ingredients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('dish_id', sa.Integer(), nullable=False),
        sa.Column('ingredient_id', sa.Integer(), nullable=False),
        sa.Column('quantity_per_serving', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=50), nullable=False),
        sa.Column('is_optional', sa.Boolean(), nullable=True, default=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['dish_id'], ['global_dishes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['ingredient_id'], ['global_ingredients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_global_dish_ingredients_dish_id'), 'global_dish_ingredients', ['dish_id'], unique=False)
    op.create_index(op.f('ix_global_dish_ingredients_ingredient_id'), 'global_dish_ingredients', ['ingredient_id'], unique=False)
    
    # Create dish_addition_logs table (analytics)
    op.create_table(
        'dish_addition_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('restaurant_id', sa.Integer(), nullable=False),
        sa.Column('global_dish_id', sa.Integer(), nullable=False),
        sa.Column('menu_item_id', sa.Integer(), nullable=False),
        sa.Column('added_by', sa.Integer(), nullable=False),
        sa.Column('price_adjustment', sa.Float(), nullable=True, default=0.0),
        sa.Column('ingredients_mapped', sa.Integer(), nullable=True, default=0),
        sa.Column('ingredients_created', sa.Integer(), nullable=True, default=0),
        sa.Column('mapping_details', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['restaurant_id'], ['restaurants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['global_dish_id'], ['global_dishes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['menu_item_id'], ['menu_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['added_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dish_addition_logs_restaurant_id'), 'dish_addition_logs', ['restaurant_id'], unique=False)
    op.create_index(op.f('ix_dish_addition_logs_global_dish_id'), 'dish_addition_logs', ['global_dish_id'], unique=False)
    
    print("✅ Global Dish Library tables created with fuzzy search support!")


def downgrade():
    """
    Downgrade: Remove Global Dish Library tables
    """
    op.drop_index(op.f('ix_dish_addition_logs_global_dish_id'), table_name='dish_addition_logs')
    op.drop_index(op.f('ix_dish_addition_logs_restaurant_id'), table_name='dish_addition_logs')
    op.drop_table('dish_addition_logs')
    
    op.drop_index(op.f('ix_global_dish_ingredients_ingredient_id'), table_name='global_dish_ingredients')
    op.drop_index(op.f('ix_global_dish_ingredients_dish_id'), table_name='global_dish_ingredients')
    op.drop_table('global_dish_ingredients')
    
    op.execute('DROP INDEX IF EXISTS idx_global_ingredients_name_trgm;')
    op.drop_index(op.f('ix_global_ingredients_category'), table_name='global_ingredients')
    op.drop_index(op.f('ix_global_ingredients_name'), table_name='global_ingredients')
    op.drop_index(op.f('ix_global_ingredients_id'), table_name='global_ingredients')
    op.drop_table('global_ingredients')
    
    op.execute('DROP INDEX IF EXISTS idx_global_dishes_name_trgm;')
    op.drop_index(op.f('ix_global_dishes_cuisine'), table_name='global_dishes')
    op.drop_index(op.f('ix_global_dishes_category'), table_name='global_dishes')
    op.drop_index(op.f('ix_global_dishes_name'), table_name='global_dishes')
    op.drop_index(op.f('ix_global_dishes_id'), table_name='global_dishes')
    op.drop_table('global_dishes')
    
    # Note: We don't drop pg_trgm extension as it might be used elsewhere
    print("✅ Global Dish Library tables removed!")
