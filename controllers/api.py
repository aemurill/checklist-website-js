# Here go your api methods.
import time

def get_checklists():
    logger.info('The session is: %r' % session)
    logged_in = auth.user is not None
    
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    checklists = []
    has_more = False
    rows = None
    if logged_in is not None:
        rows = db((db.checklist.is_public == True) | (db.checklist.user_email == get_user_email()) ).select(limitby=(start_idx, end_idx + 1))
    else:
        rows = db(db.checklist.is_public == True).select(limitby=(start_idx, end_idx + 1))
    #x = 0
    # for row in rows:
        # x = x + 1
        # print('x ', row)
    #rows = db().select(db.checklist.ALL, limitby=(start_idx, end_idx + 1))
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
        logged_in=logged_in,
    ))

@auth.requires_login()
@auth.requires_signature()
def add_checklist():
    t_id = db.checklist.insert(
        user_email = get_user_email(),
        title = request.vars.title,
        memo = request.vars.memo,
    )
    print(t_id)
    t = db.checklist(t_id)
    time.sleep(3)
    print('add_track')
    return response.json(dict(checklist=t))

@auth.requires_login()
@auth.requires_signature()
def edit_checklist():
    t_id = db.checklist.insert(
        user_email = get_user_email(),
        title = request.vars.title,
        memo = request.vars.memo,
    )
    print(t_id)
    t = db.checklist(t_id)
    time.sleep(3)
    print('add_track')
    return response.json(dict(checklist=t))

@auth.requires_login()
@auth.requires_signature()
def del_checklist():
    db(db.checklist.id == request.vars.checklist_id).delete()
    return "ok"