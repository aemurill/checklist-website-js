# Here go your api methods.
import time

def get_checklists():
    logger.info('The session is: %r' % session)
    logged_in = auth.user is not None
    if logged_in is True:
        auth_email = get_user_email()
    else:
        auth_email = None
    
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    checklists = []
    has_more = False
    rows = None
    if logged_in is not None:
        rows = db(
            (db.checklist.is_public == True) | (db.checklist.user_email == get_user_email())
            ).select(limitby=(start_idx, end_idx + 1))
    else:
        rows = db(db.checklist.is_public == True).select(limitby=(start_idx, end_idx + 1))
    print('start ', start_idx, ' end ', end_idx)
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                user_email = r.user_email,
                title = r.title,
                memo = r.memo,
                is_public = r.is_public,
            )
            checklists.append(t)
        else:
            has_more = True
    
    return response.json(dict(
        checklists=checklists,
        has_more=has_more,
        auth_email=auth_email,
        logged_in=logged_in
    ))

@auth.requires_login()
@auth.requires_signature()
def add_checklist():
    cl_id = db.checklist.insert(
        title = request.vars.title,
        memo = request.vars.memo,
    )
    print(cl_id)
    cl = db.checklist(cl_id)
    print('adding_track')
    return response.json(dict(checklist=cl))
    

@auth.requires_login()
@auth.requires_signature()
def toggle_visibility():
    cl = db.checklist(request.vars.cl_id)
    cl.update_record(is_public = not cl.is_public)
    print("toggled to: ")
    return cl.is_public

    
@auth.requires_login()
@auth.requires_signature()
def edit_checklist():
    cl = db.checklist(request.vars.cl_id)
    cl.update_record(
        title = request.vars.title,
        memo = request.vars.memo,
    )
    return "updated"

@auth.requires_login()
@auth.requires_signature()
def del_checklist():
    db(db.checklist.id == request.vars.cl_id).delete()
    return "deleted"